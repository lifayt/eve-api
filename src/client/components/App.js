import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import QueryBlueprint from "./QueryBlueprint";
import BlueprintData from "./BlueprintData";

export default class App extends React.Component {
  render() {
    return (
      <Container fluid>
        <Row style={{ justifyContent: "center" }}>
          <h2>Query Blueprint</h2>
        </Row>
        <Row>
          <Col lg={3}>
            <QueryBlueprint />
          </Col>
          <Col lg={9}>
            <BlueprintData />
          </Col>
        </Row>
      </Container>
    );
  }
}
