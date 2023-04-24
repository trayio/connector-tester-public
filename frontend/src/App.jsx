import "./App.css";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import { copyButtonIcon, copiedIcon, trayLogo } from "./icons.jsx";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import jsonata from "jsonata";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { API_URL, PARTNER_NAME, AUTH_DIALOG_URL } from "./config";
import { openAuthWindow } from "./Utils";
import { StatusCode } from "./Components/StatusCode";
//import { AutoRetryCall } from "./Utils";

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
  const serviceId = useRef("");
  const [APIresponse, setAPIresponse] = useState({});
  const [APIstatus, setAPIstatus] = useState(0);
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
  const [userId, setUserId] = useState("");
  const [isTestUser, setIsTestUser] = useState(false);
  const [serviceEnvironments, setServiceEnvironments] = useState([]);
  const [selectedServiceEnvironment, setSelectedServiceEnvironment] = useState({
    id: "",
    title: "",
    scopes: [],
  });
  const [authType, setAuthType] = useState("existing");
  const [userType, setUserType] = useState("existingUser");
  const [authError, setAuthError] = useState({
    show: false,
    message: "",
  });
  const [endUsers, setEndUsers] = useState([]);
  const requestCopyButtonRef = useRef({});
  const responseCopyButtonRef = useRef({});

  useEffect(() => {
    if (userType === "existingUser") {
      getUsers();
    }
    if (userType === "admin") {
      setIsTestUser(false);
      setUserId("admin");
    }
  }, [userType]);

  useEffect(() => {
    if (connectorsList.length > 0) {
      const versions = connectorsList
        .filter((connector) => connector.name === selectedConnectorName)
        .map((item) => item.version);
      setConnectorVersionsList(versions);
      setSelectedConnectorVersion(versions[0]);
      getConnectorOperations(selectedConnectorName, versions[0], token);
      setSelectedOperation("");
      setOperationDescription("");
      setInputObject({});
      const selectedConnector = connectorsList.find(
        (connector) =>
          connector.name === selectedConnectorName &&
          connector.version === versions[0]
      );
      serviceId.current = selectedConnector.service.id;
      serviceName.current = selectedConnector.service.name;
      serviceVersion.current = selectedConnector.service.version;
      getServiceEnvironments(serviceName.current, serviceVersion.current);
      getConnectorAuthentications(
        serviceName.current,
        serviceVersion.current,
        authentications
      );
      setShowAPIresponse(false);
      setAuthError({
        show: false,
        message: "",
      });
    }
  }, [selectedConnectorName]);

  useEffect(() => {
    if (selectedConnectorName && selectedConnectorVersion) {
      getConnectorOperations(
        selectedConnectorName,
        selectedConnectorVersion,
        token
      );
      setSelectedOperation("");
      setInputObject({});
      const selectedConnector = connectorsList.find(
        (connector) =>
          connector.name === selectedConnectorName &&
          connector.version === selectedConnectorVersion
      );
      serviceId.current = selectedConnector.service.id;
      serviceName.current = selectedConnector.service.name;
      serviceVersion.current = selectedConnector.service.version;
      getServiceEnvironments(serviceName.current, serviceVersion.current);
      getConnectorAuthentications(
        serviceName.current,
        serviceVersion.current,
        authentications
      );
      setShowAPIresponse(false);
      setAuthError({
        show: false,
        message: "",
      });
    }
  }, [selectedConnectorVersion]);

  useEffect(() => {
    if (authType === "existing" && selectedConnectorName)
      getAuthentications(token);
  }, [authType]);

  useEffect(() => {
    if (userId) getToken(userId);
  }, [userId]);

  useEffect(() => {
    if (token) getAuthentications(token);
    if (token && connectorsList.length === 0) getConnectors(token);
  }, [token]);

  useEffect(() => {
    if (
      authentications.length > 0 &&
      serviceName.current &&
      serviceVersion.current
    )
      getConnectorAuthentications(
        serviceName.current,
        serviceVersion.current,
        authentications
      );
  }, [authentications]);

  return (
    <div className="main">
      <div className="container">
        <div
          style={{ display: "flex", justifyContent: "center" }}
          dangerouslySetInnerHTML={{ __html: trayLogo }}
        ></div>
        <h1>CAPI form builder demo</h1>
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
            Continue as admin or end user or create a new end user:
          </FormLabel>
          <RadioGroup
            aria-labelledby="radio-buttons-group"
            defaultValue="existingUser"
            name="radio-buttons-group"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <FormControlLabel
              value="admin"
              control={<Radio />}
              label="Continue as Org admin"
            />
            <FormControlLabel
              value="existingUser"
              control={<Radio />}
              label="Choose existing user"
            />
            <FormControlLabel
              value="newUser"
              control={<Radio />}
              label="Create new user*"
            />
          </RadioGroup>
        </div>
        {userType === "existingUser" && (
          <div className="row">
            {endUsers.length > 0 && (
              <>
                <label className="label">
                  Select user{" "}
                  {isTestUser && <span className="test-user">Test user</span>}
                </label>
                <select
                  defaultValue=""
                  onChange={async (e) => {
                    setUserId(JSON.parse(e.target.value).id);
                    setIsTestUser(JSON.parse(e.target.value).isTestUser);
                  }}
                >
                  <option value="" key="default">
                    Select user
                  </option>
                  {endUsers.map((option) => {
                    return (
                      <option
                        value={JSON.stringify({
                          id: option.id,
                          name: option.name,
                          externalUserId: option.externalUserId,
                          isTestUser: option.isTestUser,
                        })}
                        key={option.id}
                      >
                        {option.name}
                        {"       "}
                        {option.externalUserId}
                      </option>
                    );
                  })}
                </select>
              </>
            )}
          </div>
        )}
        {userType === "newUser" && (
          <div className="row">
            <span style={{ color: "rgb(74, 84, 245)" }}>
              *After creating the user, Select the newly created user from
              'Select user' dropdown
            </span>
            <br />
            <Form
              schema={{
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Name of the end user",
                    title: "Name",
                  },
                  externalUserId: {
                    type: "string",
                    description: "External ID of the end user",
                    title: "External ID",
                  },
                  isTestUser: {
                    type: "boolean",
                    description: "Do you want to mark this user as Test?",
                    title: "Mark as test user",
                  },
                },
                required: ["name", "externalUserId"],
              }}
              validator={validator}
              onSubmit={async (e) => {
                await createExternalUser(e.formData);
                setUserType("existingUser");
              }}
            />
          </div>
        )}
        <div className="connectorsRow">
          <div className="row">
            <label className="label">Connector name</label>
            <select
              defaultValue=""
              onChange={(e) => {
                setSelectedConnectorName(e.target.value);
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
            Do you want to use existing auth or create new auth?
          </FormLabel>
          <RadioGroup
            aria-labelledby="radio-buttons-group"
            defaultValue="existing"
            name="radio-buttons-group"
            value={authType}
            onChange={(e) => {
              setAuthType(e.target.value);
            }}
          >
            <FormControlLabel
              value="existing"
              control={<Radio />}
              label="Use existing auth"
            />
            <FormControlLabel
              value="new"
              control={<Radio />}
              label="Create new auth*"
            />
          </RadioGroup>
        </div>
        {authType === "existing" ? (
          <div className="row">
            {connectorAuthentications.length > 0 ? (
              <>
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
                      authId: JSON.parse(e.target.value).id,
                    });
                    if (selectedOperation) {
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
                    }
                  }}
                >
                  <option value="" key="default">
                    Select Auth
                  </option>
                  {connectorAuthentications.map((option, index) => {
                    return (
                      <option
                        value={JSON.stringify({
                          id: option.id,
                          name: option.name,
                        })}
                        key={index}
                      >
                        {option.name}
                      </option>
                    );
                  })}
                </select>
              </>
            ) : (
              <strong>
                Oops! looks like you don't have an existing auth for this
                service.
              </strong>
            )}
          </div>
        ) : (
          <div className="row">
            <span style={{ color: "rgb(74, 84, 245)" }}>
              *After creating auth, Select the newly created auth from 'Select
              Auth' dropdown
            </span>
            <br />
            <label className="label">Select service environment</label>
            <select
              defaultValue=""
              onChange={(e) => {
                setSelectedServiceEnvironment({
                  id: JSON.parse(e.target.value).id,
                  title: JSON.parse(e.target.value).title,
                  scopes: JSON.parse(e.target.value).scopes,
                });
                setAuthError({
                  show: false,
                  message: "",
                });
              }}
            >
              <option value="" key="default">
                Select service environment
              </option>
              {serviceEnvironments.map((option, index) => {
                return (
                  <option
                    value={JSON.stringify({
                      id: option.id,
                      title: option.name,
                      scopes: option.scopes,
                    })}
                    key={index}
                  >
                    {option.title}
                  </option>
                );
              })}
            </select>
            <br />
            <button
              style={{ width: "128px" }}
              onClick={async (e) => {
                const json = await generateAuthCode();
                if (json.data) openAuthDialog(json);
                else
                  setAuthError({
                    show: true,
                    message: json?.errors[0]?.message,
                  });
              }}
            >
              Create Auth
            </button>
            {authError.show && (
              <>
                <br />
                <strong style={{ color: "red" }}>{authError.message}</strong>
              </>
            )}
          </div>
        )}
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
          <div style={{ fontSize: "120%", color: "rgb(74, 84, 245)" }}>
            {operationDescription}
          </div>
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
            defaultValue="required"
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
          {selectedOperation && (
            <Form
              schema={formType === "required" ? requiredSchema : inputSchema}
              validator={validator}
              formData={inputObject}
              onChange={async (e) => {
                setInputObject(e.formData);
                setCallConnectorPayload({
                  ...callConnectorPayload,
                  input: e.formData,
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
              }}
              onSubmit={(e) => {
                callConnector(token);
                setShowAPIresponse(true);
              }}
            />
          )}
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
        {selectedOperation && (
          <div
            className="row"
            style={{
              position: "relative",
            }}
          >
            <span style={{ fontWeight: "700", fontSize: "110%" }}>
              Call connector payload:
            </span>
            <button
              ref={requestCopyButtonRef}
              className="copy-button"
              dangerouslySetInnerHTML={{ __html: copyButtonIcon }}
              onClick={(e) => {
                navigator.clipboard.writeText(
                  JSON.stringify(callConnectorPayload, null, 4)
                );
                requestCopyButtonRef.current.innerHTML = copiedIcon;
                setTimeout(() => {
                  requestCopyButtonRef.current.innerHTML = copyButtonIcon;
                }, 700);
              }}
            ></button>
            <main id="requestPayloadContainer">
              <CodeEditor
                value={JSON.stringify(callConnectorPayload, null, 4)}
                language="json"
                onChange={(e) =>
                  setCallConnectorPayload(JSON.parse(e.target.value))
                }
                padding={15}
                style={{
                  fontSize: 16,
                  backgroundColor: "#f5f5f5",
                  fontFamily:
                    "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                }}
              />
            </main>
          </div>
        )}
        {showAPIresponse && (
          <div
            className="row"
            style={{
              position: "relative",
            }}
          >
            <span style={{ fontWeight: "700", fontSize: "110%" }}>
              Tray's API response: <StatusCode status={APIstatus}></StatusCode>
            </span>
            <button
              ref={responseCopyButtonRef}
              className="response-copy-button"
              dangerouslySetInnerHTML={{ __html: copyButtonIcon }}
              onClick={async (e) => {
                navigator.clipboard.writeText(
                  JSON.stringify(APIresponse, null, 4)
                );
                responseCopyButtonRef.current.innerHTML = copiedIcon;
                setTimeout(() => {
                  responseCopyButtonRef.current.innerHTML = copyButtonIcon;
                }, 700);
              }}
            ></button>
            <main id="responseContainer">
              <pre
                style={{
                  background: "#f5f5f5",
                  fontSize: 16,
                  padding: 15,
                  margin: 0,
                }}
              >
                <code>{JSON.stringify(APIresponse, null, 4)}</code>
              </pre>
            </main>
          </div>
        )}
      </div>
    </div>
  );

  async function getUsers() {
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const users = await jsonata(
      '$.{"id": node.id,"name": node.name,"externalUserId": node.externalUserId,"isTestUser": node.isTestUser}'
    ).evaluate(response?.data?.data?.users?.edges);
    if (users) setEndUsers(users);
  }

  async function getToken(userId) {
    const body = {
      userId: userId,
    };
    const response = await axios.post(`${API_URL}/userToken`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    setToken(response?.data?.accessToken);
  }

  async function createExternalUser(createUserFormData) {
    const { name, externalUserId, isTestUser } = createUserFormData;
    const body = {
      name: name,
      externalUserId: externalUserId,
      isTestUser: isTestUser,
    };
    const response = await axios.post(`${API_URL}/users`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response?.data;
  }

  async function getServiceEnvironments(serviceName, serviceVersion) {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(
      `${API_URL}/services/${serviceName}/versions/${serviceVersion}/environments`,
      config
    );
    const serviceEnvironments = response?.data?.elements.map((environment) => {
      return {
        id: environment.id,
        title: environment.title,
        scopes: environment.scopes,
      };
    });
    setServiceEnvironments(serviceEnvironments);
  }

  async function getConnectors(bearerToken) {
    const config = {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    };
    const response = await axios.get(`${API_URL}/connectors`, config);
    const sortExpression = jsonata("$^(name, >version)");
    const sortedList = await sortExpression.evaluate(response?.data?.elements);
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
    const response = await axios.get(
      `${API_URL}/connectors/${connectorName}/versions/${connectorVersion}/operations`,
      config
    );
    setConnectorOperations(response?.data?.elements);
  }

  async function getAuthentications(bearerToken) {
    const config = {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    };
    const response = await axios.get(`${API_URL}/authentications`, config);
    setAuthentications(response?.data?.data?.viewer?.authentications?.edges);
    return response?.data?.data?.viewer?.authentications?.edges;
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
        "Content-Type": "application/json",
      },
    };
    let response;
    try {
      response = await axios.post(
        `${API_URL}/connectors/${selectedConnectorName}/versions/${selectedConnectorVersion}/call`,
        JSON.stringify(callConnectorPayload),
        config
      );
      setAPIresponse(response?.data);
      setAPIstatus({
        code: response?.status,
        text: response?.statusText,
      });
    } catch (error) {
      setAPIresponse(error.response.data);
      setAPIstatus({
        code: error.response.status,
        text: error.response.statusText,
      });
    }
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
      const response = await axios.post(
        `${API_URL}/connectors/${selectedConnectorName}/versions/${selectedConnectorVersion}/call`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const enums = await jsonata(`output.result.value`).evaluate(
        response?.data
      );
      const enumNames = await jsonata(`output.result.text`).evaluate(
        response?.data
      );
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
          (bodyInputObject[input] =
            formData[
              ddlOperation.input[input].slice(
                ddlOperation.input[input].lastIndexOf("{") + 1,
                ddlOperation.input[input].indexOf("}")
              )
            ])
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
        const response = await axios.post(
          `${API_URL}/connectors/${selectedConnectorName}/versions/${selectedConnectorVersion}/call`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const enums = await jsonata(`[output.result.value]`).evaluate(
          response?.data
        );
        const enumNames = await jsonata(`[output.result.text]`).evaluate(
          response?.data
        );
        if (enums.length > 0) {
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

  async function generateAuthCode() {
    const body = {
      userId: userId,
    };
    const response = await axios.post(`${API_URL}/authCode`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response?.data;
  }

  async function openAuthDialog(json) {
    let scopes = await jsonata(`$join(scope, "&scopes[]=")`).evaluate(
      selectedServiceEnvironment.scopes
    );
    scopes = scopes !== undefined ? scopes : "";
    const authDialogURL = `https://${AUTH_DIALOG_URL}/external/auth/create/${PARTNER_NAME}?code=${json.data?.generateAuthorizationCode?.authorizationCode}&serviceId=${serviceId.current}&serviceEnvironmentId=${selectedServiceEnvironment.id}&scopes[]=${scopes}`;
    openAuthWindow(authDialogURL);
  }
}
