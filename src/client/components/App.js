import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
const axios = require("axios");
import QueryBlueprint from "./QueryBlueprint";
import BlueprintData from "./BlueprintData";

export default class App extends React.Component {
  state = {
    blueprint: {}
  };

  queryBlueprint = async (typeID, materialEfficiency, stationBonus, runs) => {
    const response = await axios.get(
      `/api/blueprint?typeID=${typeID}&materialEfficiency=${materialEfficiency}&stationBonus=${stationBonus}&runs=${runs}`
    );
    const blueprint = response.data;
    this.setState({ blueprint });
  };

  render() {
    return (
      <Container fluid>
        <Row style={{ justifyContent: "center" }}>
          <h2>Query Blueprint</h2>
        </Row>
        <Row>
          <Col lg={3}>
            <QueryBlueprint queryBlueprint={this.queryBlueprint} />
          </Col>
          <Col lg={9}>
            <BlueprintData blueprint={this.state.blueprint} />
          </Col>
        </Row>
      </Container>
    );
  }
}
