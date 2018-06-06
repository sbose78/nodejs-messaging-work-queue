//
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
//

"use strict";

const rhea = require("rhea");

const amqp_host = process.env.MESSAGING_SERVICE_HOST || "localhost";
const amqp_port = process.env.MESSAGING_SERVICE_PORT || 5672;
const amqp_user = process.env.MESSAGING_SERVICE_USER || "work-queue";
const amqp_password = process.env.MESSAGING_SERVICE_PASSWORD || "work-queue";

const id = Math.floor(Math.random() * (10000 - 1000)) + 1000;
const container = rhea.create_container({id: "worker-nodejs-" + id});

let worker_update_sender = null;
let requests_processed = 0;

function process_request(request) {
    return request.body.toUpperCase();
}

container.on("connection_open", function (event) {
    event.connection.open_receiver("work-queue/requests");
    worker_update_sender = event.connection.open_sender("work-queue/worker-updates");
});

container.on("message", function (event) {
    let request = event.message;
    let response_body;

    console.log("WORKER: Received request '%s'", request.body);

    try {
        response_body = process_request(request);
    } catch (e) {
        console.error("WORKER: Failed processing message: %s", e);
        return;
    }

    console.log("WORKER: Sending response '%s'", response_body);

    let response = {
        to: request.reply_to,
        correlation_id: request.id,
        application_properties: {
            workerId: container.id
        },
        body: response_body
    };

    event.connection.send(response);

    requests_processed++;
});

function send_status_update() {
    if (!worker_update_sender || !worker_update_sender.sendable()) {
        return;
    }

    console.log("WORKER: Sending update");

    let update = {
        application_properties: {
            workerId: container.id,
            timestamp: new Date().getTime(),
            requestsProcessed: requests_processed
        }
    };

    worker_update_sender.send(update);
}

setInterval(send_status_update, 5 * 1000);

const opts = {
    host: amqp_host,
    port: amqp_port,
    username: amqp_user,
    password: amqp_password,
};

container.connect(opts);

console.log("Connected to AMQP messaging service at %s:%s", amqp_host, amqp_port);
