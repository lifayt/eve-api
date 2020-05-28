import React, { Component } from "react";
import JSONPretty from "react-json-pretty";

export default class BlueprintData extends Component {
  render() {
    return <JSONPretty id="blueprint" data={this.props.blueprint}></JSONPretty>;
  }
}
