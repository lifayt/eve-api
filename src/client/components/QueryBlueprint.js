import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export default class QueryBlueprint extends Component {
  state = {
    typeID: null,
    materialEfficiency: 0,
    stationBonus: 0.99,
    runs: 1
  };

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <Form>
        <Form.Group controlId="typeID">
          <Form.Label>Enter typeID</Form.Label>
          <Form.Control
            onChange={(e) => this.onChange(e)}
            type="text"
            placeholder="typeID"
            name="typeID"
          />
        </Form.Group>
        <Form.Group controlId="materialEfficiency">
          <Form.Label>Enter ME</Form.Label>
          <Form.Control
            onChange={(e) => this.onChange(e)}
            type="text"
            placeholder="materialEfficiency"
            name="materialEfficiency"
          />
        </Form.Group>
        <Form.Group controlId="stationBonus">
          <Form.Label>Enter Station Bonus</Form.Label>
          <Form.Control
            onChange={(e) => this.onChange(e)}
            type="text"
            placeholder="stationBonus"
            name="stationBonus"
          />
        </Form.Group>
        <Form.Group controlId="runs">
          <Form.Label>Number of Runs</Form.Label>
          <Form.Control
            onChange={(e) => this.onChange(e)}
            type="text"
            placeholder="runs"
            name="runs"
          />
        </Form.Group>
        <Button
          variant="primary"
          type="button"
          onClick={() =>
            this.props.queryBlueprint(
              this.state.typeID,
              this.state.materialEfficiency,
              this.state.stationBonus,
              this.state.runs
            )
          }
        >
          Submit
        </Button>
      </Form>
    );
  }
}
