import React, { Component } from "react";
import { NavLink, Route } from "react-router-dom";
import "../App.css";
import axios from "axios";

class Jokes extends Component {
  state = {
    jokes: []
  }

  render() {
    return <div> 
      <h2>List of jokes
        <ul> {this.state.jokes.map(joke =>
          (<li className= "jokes" key={joke.id}> {joke.joke}  </li>))
        }
          </ul>
          </h2>
          </div>;
  }

  componentDidMount() {
    const token = localStorage.getItem('jwt')
    const endpoint = "http://localhost:3300/api/jokes";
    const options = {
      headers: {
        Authorization: token
      }
    };
    axios
      .get(endpoint, options)
      .then(res => {
        console.log("data from /api/jokes", res.data);
        this.setState({jokes: res.data });
      })
      .catch(err => {
        console.log("error from /api/jokes", err);
      });
  }
}

export default Jokes;
