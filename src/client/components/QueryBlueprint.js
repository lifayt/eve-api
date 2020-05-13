import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export default class QueryBlueprint extends Component {
  render() {
    return (
      <Form>
        <Form.Group controlId="typeID">
          <Form.Label>Enter typeID</Form.Label>
          <Form.Control type="text" placeholder="typeID" />
        </Form.Group>
        <Form.Group controlId="materialEfficiency">
          <Form.Label>Enter ME</Form.Label>
          <Form.Control type="text" placeholder="materialEfficiency" />
        </Form.Group>
        <Form.Group controlId="stationBonus">
          <Form.Label>Enter Station Bonus</Form.Label>
          <Form.Control type="text" placeholder="stationBonus" />
        </Form.Group>
        <Form.Group controlId="runs">
          <Form.Label>Number of Runs</Form.Label>
          <Form.Control type="text" placeholder="runs" />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    );
  }
}
