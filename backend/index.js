import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import bodyParser from "body-parser";
dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

app.get("/test", async (req, res) => {
  res.send("API working");
});

app.get("/userId", async (req, res) => {
  const token = req.header("Authorization").split(" ")[1];
  let response;
  try {
    response = await axios.get("https://api.tray.io/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    return res.status(error?.response?.status).send(error?.response?.data);
  }
  return res.status(response?.status).send(response?.data);
});

app.get("/users", async (req, res) => {
  const graphql = {
    query:
      "query {\n    users {\n        edges {\n            node {\n                name\n                id\n                externalUserId\n                isTestUser\n            }\n            cursor\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n          hasPreviousPage\n          startCursor\n        }\n    }\n}",
    variables: {},
  };

  let response;
  try {
    response = await axios.post("https://tray.io/graphql", graphql, {
      headers: {
        Authorization: `Bearer ${process.env.MASTER_TOKEN}`,
      },
    });
  } catch (error) {
    return res.status(error?.response?.status).send(error?.response?.data);
  }
  return res.status(response?.status).send(response?.data);
});

app.post("/users", async (req, res) => {
  const graphql = {
    query:
      "mutation($name: String!, $externalUserId: String!, $isTestUser: Boolean) {\n  createExternalUser(input: { \n      name: $name, \n      externalUserId: $externalUserId,\n      isTestUser: $isTestUser\n    }) {\n      userId\n  }\n}",
    variables: {
      name: req.body.name,
      externalUserId: req.body.externalUserId,
      isTestUser: req.body.isTestUser,
    },
  };

  let response;
  try {
    response = await axios.post("https://tray.io/graphql", graphql, {
      headers: {
        Authorization: `Bearer ${process.env.MASTER_TOKEN}`,
      },
    });
  } catch (error) {
    return res.status(error?.response?.status).send(error?.response?.data);
  }
  return res.status(response?.status).send(response?.data);
});

app.get("/connectors", async (req, res) => {
  const token = req.header("Authorization").split(" ")[1];
  let response;
  try {
    response = await axios.get("https://api.tray.io/core/v1/connectors", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    return res.status(error?.response?.status).send(error?.response?.data);
  }
  return res.status(response?.status).send(response?.data);
});

app.get(
  "/connectors/:connectorName/versions/:connectorVersion/operations",
  async (req, res) => {
    const token = req.header("Authorization").split(" ")[1];
    const { connectorName, connectorVersion } = { ...req.params };

    let response;
    try {
      response = await axios.get(
        `https://api.tray.io/core/v1/connectors/${connectorName}/versions/${connectorVersion}/operations`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      return res.status(error?.response?.status).send(error?.response?.data);
    }
    return res.status(response?.status).send(response?.data);
  }
);

app.post("/userToken", async (req, res) => {
  if (req.body.userId === "admin") {
    return res.status(200).send({
      accessToken: process.env.MASTER_TOKEN,
    });
  }

  const graphql = {
    query:
      "mutation ($userId: ID!) {\n  authorize(input: {\n      userId: $userId\n  }) {\n    accessToken\n  }\n}",
    variables: { userId: req.body.userId },
  };

  let response;
  try {
    response = await axios.post("https://tray.io/graphql", graphql, {
      headers: {
        Authorization: `Bearer ${process.env.MASTER_TOKEN}`,
      },
    });
  } catch (error) {
    return res.status(error?.response?.status).send(error?.response?.data);
  }
  return res.status(response?.status).send(response?.data?.data?.authorize);
});

app.get("/authentications", async (req, res) => {
  const token = req.header("Authorization").split(" ")[1];

  const graphql = {
    query:
      "query {\n  viewer {\n    authentications {\n      edges {\n        node {\n          id\n          name\n          customFields\n          service {\n            id,\n            name,\n            icon,\n            title,\n            version\n          }\n          serviceEnvironment {\n              id\n              title\n          }\n        }\n      }\n      pageInfo{\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n}",
    variables: {},
  };

  let response;
  try {
    response = await axios.post("https://tray.io/graphql", graphql, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    return res.status(error?.response?.status).send(error?.response?.data);
  }
  return res.status(response?.status).send(response?.data);
});

app.get(
  "/services/:serviceName/versions/:serviceVersion/environments",
  async (req, res) => {
    const token = req.header("Authorization").split(" ")[1];
    const { serviceName, serviceVersion } = { ...req.params };
    let response;
    if (serviceName && serviceVersion) {
      try {
        response = await axios.get(
          `https://api.tray.io/core/v1/services/${serviceName}/versions/${serviceVersion}/environments`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        return res.status(error?.response?.status).send(error?.response?.data);
      }
    }
    return res.status(response?.status).send(response?.data);
  }
);

app.post("/authCode", async (req, res) => {
  const graphql = {
    query:
      "mutation ($userId: ID!) {\n  generateAuthorizationCode( input: {\n    userId: $userId\n  }) {\n    authorizationCode\n  }\n}",
    variables: { userId: req.body.userId },
  };

  let response;
  try {
    response = await axios.post("https://tray.io/graphql", graphql, {
      headers: {
        Authorization: `Bearer ${process.env.MASTER_TOKEN}`,
      },
    });
  } catch (error) {
    return res.status(error?.response?.status).send(error?.response?.data);
  }
  return res.status(response?.status).send(response?.data);
});

app.post(
  "/connectors/:connectorName/versions/:connectorVersion/call",
  async (req, res) => {
    const token = req.header("Authorization").split(" ")[1];
    const { connectorName, connectorVersion } = { ...req.params };

    let response;
    try {
      response = await axios.post(
        `https://api.tray.io/core/v1/connectors/${connectorName}/versions/${connectorVersion}/call`,
        req.body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      return res.status(error?.response?.status).send(error?.response?.data);
    }
    return res.status(response?.status).send(response?.data);
  }
);

app.listen(PORT, () =>
  console.log(`Server running on: http://localhost:${PORT}`)
);

export default app;
