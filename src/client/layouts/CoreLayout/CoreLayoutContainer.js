import { connect } from 'react-redux'

import CoreLayout from './CoreLayout'

import {
  saveAppState
  } from '../../store/app'

import {
  removeNotifications,
  updateNotification,
  addNotification
  } from 'reapop'

const mapDispatchToProps = {
  removeNotifications,
  updateNotification,
  addNotification,
  saveAppState
}

const mapStateToProps = (state) => ({
  appState: state.app
})

export default connect(
  mapStateToProps,
  mapDispatchToProps)(CoreLayout)
