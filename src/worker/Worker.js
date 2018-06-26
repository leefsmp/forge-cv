import puppeteer from 'puppeteer'
import pathUtils from 'path'
import cv from 'opencv'
import fs from 'fs'

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
const loadImage = (filename) => {

  return new Promise((resolve, reject) => {

    cv.readImage(filename, (err, img) => {

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
//
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
//
//
/////////////////////////////////////////////////////////////////
const setState = (page, state) => {
  return page.evaluate((state) => {
    window.setState(state)
  }, state)
}

/////////////////////////////////////////////////////////////////
//
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
//
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



export default class Worker {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (config) {

    this.sendMessage = this.sendMessage.bind(this)

    this.pid = process.pid
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  sendMessage (msg) {

    process.send(msg)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  terminate () {

    if (this.browser) {

      this.browser.close()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async load (accessToken, urn) {

    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--hide-scrollbars',
        '--mute-audio',
        '--headless'
      ]
    })

    try {
  
      const filename = pathUtils.resolve(
        __dirname, '../..',
        './resources/viewer/viewer.html')
  
      const url = `file://${filename}?accessToken=${accessToken}&urn=${urn}`
      
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
  //
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
}