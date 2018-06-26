import autobind from 'autobind-decorator'
import NotificationsSystem from 'reapop'
import ServiceManager from 'SvcManager'
import theme from 'reapop-theme-custom'
import PropTypes from 'prop-types'
import 'Dialogs/dialogs.scss'
import Header from 'Header'
import React from 'react'
import 'core.scss'

class CoreLayout extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    children : PropTypes.element.isRequired
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super(props)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

    this.notifySvc =
      ServiceManager.getService(
        'NotifySvc')

    this.notifySvc.initialize ({
      remove: this.props.removeNotifications,
      update: this.props.updateNotification,
      add: this.props.addNotification
    })

    this.socketSvc =
      ServiceManager.getService(
        'SocketSvc')

    this.dialogSvc =
      ServiceManager.getService(
        'DialogSvc')

    this.dialogSvc.setComponent(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className='container'>
        <div className='notifications'>
          <NotificationsSystem theme={theme}/>
        </div>
        <Header {...this.props} />
        <div className='core-layout__viewport'>
          {this.props.children}
        </div>
        { this.dialogSvc.render() }
      </div>
    )
  }
}

export default CoreLayout
