import { IndexLink, Link } from 'react-router'
import {client as config} from 'c0nfig'
import Background from 'Background'
import React from 'react'
import './HomeView.scss'

class HomeView extends React.Component {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor() {

    super()

    this.state = {
      models: config.models
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    return (
      <div className="home">
        <Background/>
        <div className="models">
          <div className="title">
            Choose Model
          </div>
          <div className="content responsive-grid">
            {
              this.state.models.map((model, idx) => {

                let query = `urn=${model.urn}`

                if (model.extensions) {

                  query += '&extIds=' + model.extensions.join(';')
                }

                return (
                  <Link key={idx} to={`/viewer?${query}`}>
                    <figure>
                      <figcaption>
                        {model.name}
                      </figcaption>
                      <img className='default-thumbnail' src={model.thumbnail || ''}/>
                    </figure>
                  </Link>)
              })
            }
          </div>
        </div>
      </div>
    )
  }
}

export default HomeView
























































