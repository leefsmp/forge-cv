import puppeteer from 'puppeteer'
import pathUtils from 'path'
import cv from 'opencv'
import fs from 'fs'

/////////////////////////////////////////////////////////////////
// Loads an image with node OpenCV SDK
//
/////////////////////////////////////////////////////////////////
const loadImage = (source) => {

  return new Promise((resolve, reject) => {

    cv.readImage(source, (err, img) => {

      try {

        if (err) {
          return reject(err)
        }
      
        if (img.height() < 1 || img.width() < 1) {
          return reject('Image has no size')
        }
      
      resolve(img)

      } catch(ex) {

        return reject(ex)
      }
    })
  })
}

/////////////////////////////////////////////////////////////////
// Gets Oriented Bounding Box with node OpenCV SDK
//
/////////////////////////////////////////////////////////////////
const getOBB = (img) => {

  const highThresh = 150
  const iterations = 2
  const lowThresh = 0

  img.convertGrayscale()
  img.gaussianBlur([3, 3])
  img.canny(lowThresh, highThresh)
  img.dilate(iterations)

  const contours = img.findContours()

  const clr = [0, 0, 255]

  let largestAreaIndex = 0
  let largestArea = 0

  for (let i = 0; i < contours.size(); ++i) {
    if (contours.area(i) > largestArea) {
      largestArea = contours.area(i)
      largestAreaIndex = i
    }
  }

  return contours.minAreaRect(largestAreaIndex)
}

/////////////////////////////////////////////////////////////////
// Objects detection
//
/////////////////////////////////////////////////////////////////
const detectObjects = (data, img) => {

  return new Promise((resolve, reject) => {

    img.detectObject(data, {}, (err, objects) => {

      return err 
        ? reject(err)
        : resolve(objects)
    
    })
  })
}

/////////////////////////////////////////////////////////////////
// Helper method for puppeteer
//
/////////////////////////////////////////////////////////////////
const setState = (page, state) => {
  return page.evaluate((state) => {
    window.setState(state)
  }, state)
}

/////////////////////////////////////////////////////////////////
// Helper method for puppeteer
//
/////////////////////////////////////////////////////////////////
const clientToWorld = (page, {x, y}) => {

  return new Promise(async(resolve, reject) => {

    const onMessage = (msg) => {
      page.removeListener('console', onMessage)
      resolve (JSON.parse(msg._text))
    }

    page.on('console', onMessage)

    page.evaluate((x, y) => {
      console.log(window.clientToWorld(x,y))
    }, x, y)
  })
}

/////////////////////////////////////////////////////////////////
// Generates random GUID
//
/////////////////////////////////////////////////////////////////
const guid = (format='xxxxxxxxxxxx') => {

  var d = new Date().getTime();

  var guid = format.replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });

  return guid
}


/////////////////////////////////////////////////////////
// Worker implementation
//
/////////////////////////////////////////////////////////
export default class Worker {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (config) {

    this.sendMessage = this.sendMessage.bind(this)

    this.pid = process.pid

    this.config = config
  }

  /////////////////////////////////////////////////////////
  // Sends message to master process
  //
  /////////////////////////////////////////////////////////
  sendMessage (msg) {

    process.send(msg)
  }

  /////////////////////////////////////////////////////////
  // Terminates worker
  //
  /////////////////////////////////////////////////////////
  terminate () {

    if (this.browser) {

      this.browser.close()
    }
  }

  /////////////////////////////////////////////////////////
  // Fires an instance of puppeteer
  // and loads Forge model from URN
  // 
  /////////////////////////////////////////////////////////
  async load (accessToken, urn, path) {

    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--hide-scrollbars',
        '--mute-audio',
        '--no-sandbox',
        '--headless'
      ]
    })

    try {
  
      const filename = pathUtils.resolve(
        __dirname, '../..',
        'resources/viewer/viewer.html')
  
      let url = this.config.viewerUrl || `file://${filename}`
      
      if (urn) {

        url += `?accessToken=${accessToken}&urn=${urn}`

      } else if (path) {

        url += `?path=${path}`
      }
       
      const page = await browser.newPage()

      await page.goto(url)

      await page.mainFrame().waitForSelector(
        '.geometry-loaded', {
          timeout: 300000
        })
      
      this.browser = browser
      this.page = page

      this.sendMessage({
        data: 'loaded',
        status: 200,
        id: 'load'
      })
    
    } catch (ex) {
  
      browser.close()

      this.sendMessage({
        status: 500,
        id: 'load',
        data: ex
      })
    } 
  }

  /////////////////////////////////////////////////////////
  // Gets Oriented Bounding Box
  //
  /////////////////////////////////////////////////////////
  async getOBB (state, size) {

    try {
  
      await setState(this.page, state)

      const path = pathUtils.resolve(
        __dirname, '../..',
        `./TMP/${guid()}.jpg`)  

      const clip  = {
        height: size.height,  
        width: size.width,  
        x: 0,
        y: 0,
      }  

      await this.page.setViewport(size)

      const buffer = 
        await this.page.screenshot({
          path,
          clip
        })

      const img = await loadImage(path)

      const obb = getOBB (img)

      const p1 = await clientToWorld(this.page, obb.points[0])
      const p2 = await clientToWorld(this.page, obb.points[1])
      const p3 = await clientToWorld(this.page, obb.points[2])
      const p4 = await clientToWorld(this.page, obb.points[3])

      fs.unlink(path, (error) => {}) 

      this.sendMessage({
        data: [p1, p2, p3, p4],
        status: 200,
        id: 'obb'
      })

    } catch (ex) {

      this.sendMessage({
        status: 500,
        id: 'obb',
        data: ex
      })
    } 
  }

  /////////////////////////////////////////////////////////
  // 
  //
  /////////////////////////////////////////////////////////
  async detectObjects (state, size) {

    try {
  
      await setState(this.page, state)

      const path = pathUtils.resolve(
        __dirname, '../..',
        `./TMP/${guid()}.jpg`)  

      const clip  = {
        height: size.height,  
        width: size.width,  
        x: 0,
        y: 0,
      }  

      await this.page.setViewport(size)

      const buffer = 
        await this.page.screenshot({
          path,
          clip
        })

      const img = await loadImage(path)

      const sideview = pathUtils.resolve(
        __dirname, '../..',
        `./data/car/sideview.xml`)

      const cars = pathUtils.resolve(
        __dirname, '../..',
        `./data/car/cars.xml`)

      const views = [cars]
      
      const res = []

      for (let i=0; i<views.length; ++i) {
      
        const objects = await detectObjects (views[i], img)

        for (let j=0; j<objects.length; ++j) {

          const obj = objects[j]

          const p1 = await clientToWorld(this.page, {
            x: obj.x,
            y: obj.y,
          })

          const p2 = await clientToWorld(this.page, {
            x: obj.x + obj.width,
            y: obj.y,
          })

          const p3 = await clientToWorld(this.page, {
            x: obj.x + obj.width,
            y: obj.y + obj.height,
          })

          const p4 = await clientToWorld(this.page, {
            x: obj.x,
            y: obj.y + obj.height,
          })

          res.push([p1, p2, p3, p4])
        }
      }

      fs.unlink(path, (error) => {}) 

      this.sendMessage({
        status: 200,
        id: 'detect',
        data: res
      })

    } catch (ex) {
      
      this.sendMessage({
        status: 500,
        id: 'detect',
        data: ex
      })
    } 
  }
}