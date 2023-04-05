import "./App.css";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import { trayLogo } from "./icons";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import jsonata from "jsonata";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { API_URL } from "./config";

export default function App() {
  const [connectorsList, setConnectorsList] = useState([]);
  const [connectorNames, setConnectorNamesList] = useState([]);
  const [connectorVersionsList, setConnectorVersionsList] = useState([]);
  const [selectedConnectorName, setSelectedConnectorName] = useState("");
  const [selectedConnectorVersion, setSelectedConnectorVersion] = useState("");
  const [selectedOperation, setSelectedOperation] = useState("");
  const [operationDescription, setOperationDescription] = useState("");
  const [connectorOperations, setConnectorOperations] = useState([]);
  const [inputSchema, setInputSchema] = useState({});
  const inputSchemaRef = useRef({});
  const [inputObject, setInputObject] = useState({});
  const [token, setToken] = useState("");
  const [authentications, setAuthentications] = useState([]);
  const [connectorAuthentications, setConnectorAuthentications] = useState([]);
  const [selectedAuthentication, setSelectedAuthentication] = useState({
    id: "",
    name: "",
  });
  const serviceName = useRef("");
  const serviceVersion = useRef("");
  const [APIresponse, setAPIresponse] = useState({});
  const [showAPIresponse, setShowAPIresponse] = useState(false);
  const [requiredSchema, setRequiredSchema] = useState({});
  const [formType, setFormType] = useState("required");
  const dependentDDLOperations = useRef([]);
  const [callConnectorPayload, setCallConnectorPayload] = useState({
    operation: selectedOperation,
    authId: selectedAuthentication.id,
    input: inputObject,
    returnOutputSchema: false,
  });

  useEffect(() => {
    if (connectorVersionsList.length !== 0)
      getConnectorOperations(
        selectedConnectorName,
        connectorVersionsList[0],
        token
      );
  }, [selectedConnectorName]);

  return (
    <div className="main">
      <div className="container">
        <div
          style={{ display: "flex", justifyContent: "center" }}
          dangerouslySetInnerHTML={{ __html: trayLogo }}
        ></div>
        <h1>CAPI form builder demo</h1>
        <div className="row">
          <label className="label">Enter user token</label>
          <input
            type="password"
            onBlur={async (e) => {
              setToken(e.target.value);
              getAuthentications(e.target.value);
              getConnectors(e.target.value);
            }}
          />
        </div>
        <div className="connectorsRow">
          <div className="row">
            <label className="label">Connector name</label>
            <select
              defaultValue=""
              onChange={(e) => {
                setSelectedConnectorName(e.target.value);
                const versions = connectorsList
                  .filter((connector) => connector.name === e.target.value)
                  .map((item) => item.version);
                setConnectorVersionsList(versions);
                setSelectedConnectorVersion(versions[0]);
                setSelectedOperation("");
                setOperationDescription("");
                setInputObject({});
                const selectedConnector = connectorsList.filter(
                  (connector) =>
                    connector.name === e.target.value &&
                    connector.version === versions[0]
                );
                serviceName.current = selectedConnector[0].service.name;
                serviceVersion.current = selectedConnector[0].service.version;
                getConnectorAuthentications(
                  serviceName.current,
                  serviceVersion.current,
                  authentications
                );
                setShowAPIresponse(false);
              }}
            >
              <option value="" key="default">
                Select connector
              </option>
              {connectorNames?.length &&
                connectorNames.map((option, index) => {
                  return (
                    <option value={option} key={index}>
                      {option}
                    </option>
                  );
                })}
            </select>
          </div>
          <div className="row">
            <label className="label">Version</label>
            <select
              defaultValue=""
              onChange={(e) => {
                setSelectedConnectorVersion(e.target.value);
                getConnectorOperations(
                  selectedConnectorName,
                  e.target.value,
                  token
                );
                setSelectedOperation("");
                setInputObject({});
                const selectedConnector = connectorsList.filter(
                  (connector) =>
                    connector.name === selectedConnectorName &&
                    connector.version === e.target.value
                );
                serviceName.current = selectedConnector[0].service.name;
                serviceVersion.current = selectedConnector[0].service.version;
                getConnectorAuthentications(
                  serviceName.current,
                  serviceVersion.current,
                  authentications
                );
                setShowAPIresponse(false);
              }}
            >
              <option value="" key="default">
                Select version
              </option>
              {connectorVersionsList?.length &&
                connectorVersionsList.map((option, index) => {
                  return (
                    <option value={option} key={index}>
                      {option}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>
        <div className="row">
          <label className="label">Select Auth</label>
          <select
            defaultValue=""
            onChange={async (e) => {
              setSelectedAuthentication({
                id: JSON.parse(e.target.value).id,
                name: JSON.parse(e.target.value).name,
              });
              setShowAPIresponse(false);
              setCallConnectorPayload({
                ...callConnectorPayload,
                authId: JSON.parse(e.target.value).id
              });
            }}
          >
            <option value="" key="default">
              Select Auth
            </option>
            {connectorAuthentications?.length &&
              connectorAuthentications.map((option, index) => {
                return (
                  <option
                    value={JSON.stringify({ id: option.id, name: option.name })}
                    key={index}
                  >
                    {option.name}
                  </option>
                );
              })}
          </select>
        </div>
        <div className="row">
          <label className="label">
            Operations{" "}
            <span style={{ fontSize: "80%", fontStyle: "normal" }}>
              (API operation name:{" "}
              <span style={{ color: "rgb(74, 84, 245)" }}>
                {selectedOperation}
              </span>
              )
            </span>
          </label>
          <select
            defaultValue=""
            onChange={async (e) => {
              const inputSchema = JSON.parse(e.target.value).inputSchema;
              const depedentDDLs = await jsonata(
                `[**.lookup[input!={}]]`
              ).evaluate(inputSchema);
              dependentDDLOperations.current = depedentDDLs;
              delete inputSchema["$schema"];
              delete inputSchema["advanced"];
              delete inputSchema["additionalProperties"];
              const transformedInputSchema = JSON.parse(
                JSON.stringify(inputSchema),
                (k, v) => (Array.isArray(v) && k === "type" ? "string" : v)
              );
              inputSchemaRef.current = transformedInputSchema;
              for (let key in inputSchemaRef.current.properties) {
                await populateDDLSchema(inputSchemaRef.current, key);
              }
              const onlyRequired = {
                type: "object",
                properties: {},
                required: inputSchema.required,
              };
              inputSchemaRef.current.required.map((key) => {
                onlyRequired.properties[key] =
                  inputSchemaRef.current.properties[key];
              });
              setRequiredSchema(onlyRequired);
              setInputSchema(inputSchemaRef.current);
              setSelectedOperation(JSON.parse(e.target.value).name);
              setOperationDescription(JSON.parse(e.target.value).description);
              setInputObject({});
              setShowAPIresponse(false);
              setCallConnectorPayload({
                operation: JSON.parse(e.target.value).name,
                authId: selectedAuthentication.id,
                input: {},
                returnOutputSchema: false,
              });
            }}
          >
            <option value="" key="default">
              Select operation
            </option>
            {connectorOperations?.length &&
              connectorOperations.map((option) => {
                return (
                  <option
                    key={option.name}
                    value={JSON.stringify({
                      inputSchema: option.inputSchema,
                      name: option.name,
                      description: option.description,
                    })}
                  >
                    {option.title}
                  </option>
                );
              })}
          </select>
        </div>
        <div className="row">
          <div style={{ fontSize: "125%" }}>{operationDescription}</div>
        </div>
        <div className="row" style={{ marginTop: "0" }}>
          <FormLabel
            id="radio-buttons-group"
            style={{
              color: "#000",
              fontWeight: "900",
              marginBottom: "10px",
              fontSize: "1.2rem",
            }}
          >
            Do you want to see full form or only required?
          </FormLabel>
          <RadioGroup
            aria-labelledby="radio-buttons-group"
            defaultValue="female"
            name="radio-buttons-group"
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
          >
            <FormControlLabel
              value="full"
              control={<Radio />}
              label="Show full form"
            />
            <FormControlLabel
              value="required"
              control={<Radio />}
              label="Show only required fields"
            />
          </RadioGroup>
        </div>
        <div className="row" style={{ marginTop: "0" }}>
          {selectedOperation && <Form
            schema={formType === "required" ? requiredSchema : inputSchema}
            validator={validator}
            formData={inputObject}
            onChange={async (e) => {
              if (Object.values(e.formData).every((value) => value)) {
                setInputObject(e.formData);
                setCallConnectorPayload({
                  ...callConnectorPayload,
                  input: e.formData
                });
                await checkAndPopulateDependentDDL(e.formData);
                setInputSchema(inputSchemaRef.current);
                const onlyRequired = {
                  type: "object",
                  properties: {},
                  required: inputSchema.required,
                };
                inputSchemaRef.current.required.map((key) => {
                  onlyRequired.properties[key] =
                    inputSchemaRef.current.properties[key];
                });
                setRequiredSchema(onlyRequired);
              }
            }}
            onSubmit={(e) => {
              callConnector(token);
              setShowAPIresponse(true);
            }}
          />}
        </div>
        <div className="row" style={{ display: "block" }}>
          <span style={{ fontWeight: "700", fontSize: "110%" }}>
            Call connector endpoint:{" "}
          </span>
          <span style={{ color: "rgb(74, 84, 245)" }}>
            {selectedConnectorVersion &&
              `https://api.tray.io/core/v1/connectors/${selectedConnectorName}/versions/${selectedConnectorVersion}/call`}
          </span>
        </div>
        <div className="row">
          <span style={{ fontWeight: "700", fontSize: "110%" }}>
            Call connector payload:
          </span>
          <main id="requestPayloadContainer">
            {selectedOperation &&
              <CodeEditor
                value={JSON.stringify(callConnectorPayload, null, 4)}
                language="json"
                onChange={(e) => setCallConnectorPayload(JSON.parse(e.target.value))}
                padding={15}
                style={{
                  fontSize: 16,
                  backgroundColor: "#f5f5f5",
                  fontFamily:
                    "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                }}
              />}
          </main>
        </div>
        {showAPIresponse && (
          <div className="row">
            <span style={{ fontWeight: "700", fontSize: "110%" }}>
              API response:
            </span>
            <main id="requestPayloadContainer">
              <pre style={{ background: "#f5f5f5", fontSize: 16, padding: 15 }}>
                <code>
                  {JSON.stringify(APIresponse, null, 4)}
                </code>
              </pre>
            </main>
          </div>
        )}
      </div>
    </div>
  );

  async function getConnectors(bearerToken) {
    const config = {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    };
    const res = await axios.get(
      `${API_URL}/connectors`,
      config
    );
    const sortExpression = jsonata("$^(name, >version)");
    const sortedList = await sortExpression.evaluate(res?.data?.elements);
    setConnectorsList(sortedList);
    const uniqueExpression = jsonata("$distinct($.name)");
    const result = await uniqueExpression.evaluate(sortedList);
    setConnectorNamesList(result);
  }

  async function getConnectorOperations(
    connectorName,
    connectorVersion,
    bearerToken
  ) {
    const config = {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    };
    const res = await axios.get(
      `${API_URL}/connectors/${connectorName}/versions/${connectorVersion}/operations`,
      config
    );
    setConnectorOperations(res?.data?.elements);
  }

  async function getAuthentications(bearerToken) {
    const config = {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    };
    const res = await axios.get(`${API_URL}/authentications`, config);
    setAuthentications(res?.data?.data?.viewer?.authentications?.edges);
  }

  async function getConnectorAuthentications(
    service,
    version,
    authentications
  ) {
    const filteredList = authentications
      .filter(
        (auth) =>
          auth.node.service.name === service &&
          auth.node.service.version == version
      )
      .map((connectorAuth) => {
        return {
          id: connectorAuth.node.id,
          name: connectorAuth.node.name,
        };
      });
    setConnectorAuthentications(filteredList);
  }

  async function callConnector(bearerToken) {
    const config = {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json"
      },
    };
    const res = await axios.post(
      `${API_URL}/connectors/${selectedConnectorName}/versions/${selectedConnectorVersion}/call`,
      JSON.stringify(callConnectorPayload),
      config
    );
    setAPIresponse(res?.data);
  }

  async function populateDDLSchema(inputSchema, key) {
    const expression = jsonata("**.lookup");
    const result = await expression.evaluate(inputSchema.properties[key]);
    if (typeof result === "object" && JSON.stringify(result.input) === "{}") {
      const body = {
        operation: result.operation,
        authId: selectedAuthentication.id,
        input: {},
        returnOutputSchema: false,
      };
      const response = await fetch(
        `${API_URL}/connectors/${selectedConnectorName}/versions/${selectedConnectorVersion}/call`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const json = await response.json();
      const enums = await jsonata(`output.result.value`).evaluate(json);
      const enumNames = await jsonata(`output.result.text`).evaluate(json);
      if (Array.isArray(enums)) {
        const newInputSchema = await jsonata(`$~>|**|{
    "enum":lookup.operation=$operation?$enumValues,
    "enumNames":lookup.operation=$operation?$enumLabels
}|`).evaluate(inputSchemaRef.current, {
          operation: result.operation,
          enumValues: enums,
          enumLabels: enumNames,
        });
        inputSchemaRef.current = newInputSchema;
      }
    }
  }

  async function checkAndPopulateDependentDDL(formData) {
    for (let i = 0; i < dependentDDLOperations.current?.length; i++) {
      const ddlOperation = dependentDDLOperations.current[i];
      const inputs = Object.keys(ddlOperation.input);
      const bodyInputObject = {};
      inputs.forEach(
        (input) =>
          bodyInputObject[input] =
            formData[
              ddlOperation.input[input].slice(
                ddlOperation.input[input].lastIndexOf("{") + 1,
                ddlOperation.input[input].indexOf("}")
              )
            ]
      );
      if (
        inputs.every(
          (key) =>
            formData[
              ddlOperation.input[key].slice(
                ddlOperation.input[key].lastIndexOf("{") + 1,
                ddlOperation.input[key].indexOf("}")
              )
            ]
        )
      ) {
        const body = {
          operation: ddlOperation.operation,
          authId: selectedAuthentication.id,
          input: bodyInputObject,
          returnOutputSchema: false,
        };
        const response = await fetch(
          `${API_URL}/connectors/${selectedConnectorName}/versions/${selectedConnectorVersion}/call`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );
        const json = await response.json();
        const enums = await jsonata(`[output.result.value]`).evaluate(json);
        const enumNames = await jsonata(`[output.result.text]`).evaluate(json);
        if (enums.length>0) {
          const newInputSchema = await jsonata(`$~>|**|{
    "enum":lookup.operation=$operation?$enumValues,
    "enumNames":lookup.operation=$operation?$enumLabels
}|`).evaluate(inputSchemaRef.current, {
            operation: ddlOperation.operation,
            enumValues: enums,
            enumLabels: enumNames,
          });
          inputSchemaRef.current = newInputSchema;
          dependentDDLOperations.current.splice(i, 1);
        }
      }
    }
  }
}