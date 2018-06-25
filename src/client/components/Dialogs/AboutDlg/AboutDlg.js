import React, { PropTypes } from 'react'
import Modal from 'react-modal'
import './AboutDlg.scss'

export default class AboutDlg extends React.Component {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor() {

    super()

  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  close () {

    this.props.close()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    const style = {
      overlay: {
        backgroundColor: 'rgba(201, 201, 201, 0.50)'
      }
    }

    return (
      <div>
        <Modal className="dialog about"
          contentLabel=""
          style={style}
          isOpen={this.props.open}
          onRequestClose={() => {this.close()}}>

          <div className="title">
            <img/>
            <b>About Forge CV ...</b>
          </div>

          <div className="content">
             <div>
               Written by Philippe Leefsma
               <br/>
               <a href="https://twitter.com/F3lipek" target="_blank">
               @F3lipek
               </a>
               &nbsp;- June 2018
               <br/>
               <br/>
               Source on github:
               <br/>
               <a href="https://github.com/leefsmp/forge-cv" target="_blank">
               Forge CV
               </a>
             </div>
          </div>
        </Modal>
      </div>
    )
  }
}
