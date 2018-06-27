import puppeteer from 'puppeteer'
import BaseSvc from './BaseSvc'
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

export default class ViewerSvc extends BaseSvc {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (config) {

    super (config)

    this._instances = {}
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name() {

    return 'ViewerSvc'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  load (instanceId, accessToken, urn) {

    return new Promise(async(resolve, reject) => {

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
          __dirname, '../../../..',
          './resources/viewer/viewer.html')
    
        const url = `file://${filename}?accessToken=${accessToken}&urn=${urn}`
        
        const page = await browser.newPage()

        await page.goto(url)

        await page.mainFrame().waitForSelector(
          '.geometry-loaded', {
            timeout: 300000
          })
        
        this._instances[instanceId] = {
          browser,
          page
        }

        resolve()
      
      } catch (ex) {
    
        browser.close()

        reject (ex)
      } 
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getOBB (instanceId, {state, size}) {

   return new Promise(async(resolve, reject) => {

      try {
    
        if(!this._instances[instanceId]) {
          return reject('Invalid instanceId')
        }

        const {page} = this._instances[instanceId]

        await setState(page, state)

        const path = pathUtils.resolve(
          __dirname, '../../../..',
          `./TMP/${guid()}.jpg`)  

        const clip  = {
          height: size.height,  
          width: size.width,  
          x: 0,
          y: 0,
        }  

        await page.setViewport(size)

        await page.screenshot({
          path,
          clip
        })

        const img = await loadImage(path)

        const obb = getOBB (img)

        const p1 = await clientToWorld(page, obb.points[0])
        const p2 = await clientToWorld(page, obb.points[1])
        const p3 = await clientToWorld(page, obb.points[2])
        const p4 = await clientToWorld(page, obb.points[3])

        fs.unlink(path, (error) => {}) 

        resolve ([p1, p2, p3, p4])
      
      } catch (ex) {
    
        reject (ex)
      } 
    })
  }
}