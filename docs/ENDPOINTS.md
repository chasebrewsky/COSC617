# Endpoints

This document contains a living outline of how to interact with the REST API endpoints and the data that should be returned from them. Each major section groups related endpoints by an object the endpoints center around. Each subsection outlines the action the endpoint is trying to achieve, like **Create Channel**, and the sections below that break up the request schema the endpoint receives and the response schema that is given.

## Channels

### Create Channel

#### Request `POST /api/channels`

**Body**

```json
{
  "name": "Channel"
}
```

#### Response

**Body**

```json
{
  "id": "12345",
  "name": "Channel"
}
```

### List Channels

#### Request `GET /api/channels`

#### Response

**Body**

```json
{
  "results": [
    {
      "id": "12345",
      "name": "Channel One"
    },
    {
      "id": "12345",
      "name": "Channel Two"
    }
  ]
}
```

### Get Channel

#### Request `GET /api/channels/{id}`

**URL Params**

* **id**: ID of the channel.

#### Response

**Body**

```json
{
  "id": "12345",
  "name": "New"
}
```

### Update Channel

#### Request `PUT /api/channels/{id}`

**URL Params**

* **id**: ID of the channel.

**Body**

```json
{
  "name": "New"
}
```

#### Response

```json
{
  "id": "12345",
  "name": "New"
}
```

### List Channel Messages

#### Request `GET /api/channels/{id}/messages?last=[str]?limit=[int]`

**URL Params**

* **id**: ID of the channel.

**Query Params**

* **last**: The ID of the last message received.
* **limit**: Maximum number of results to return.

#### Response

**Body**

```json
{
  "next": "https://localhost:3000/api/channel",
  "results": [
    {
      "id": "12345",
      "author": {
        "id": "12345",
        "username": "george.costanza"
      },
      "content": "Hello"
    },
    {
      "id": "12345",
      "author": {
        "id": "12345",
        "username": "george.costanza"
      },
      "content": "Hello"
    }
  ]
}
```

## Users

### Get User

#### Request `GET /api/users/{id}`

**URL Params**

* **id**: ID of the user.

#### Response

**Body**

```json
{
  "id": "12345",
  "username": "george.costanza",
  "firstName": "George",
  "lastName": "Costanza"
}
```

## Direct Message Channels

Time to slide into the DMs

### Create Direct Message Channel

The channel has to be created before any messages can be made in the direct message channel.

#### Request `POST /api/dms`

**Body**

```json
{
  "user": "12345"
}
```

#### Response

**Body**

```json
{
  "id": "12345",
  "user": {
    "id": "12345",
    "username": "george.costanza"
  }
}
```

### List Direct Message Channels

#### Request `GET /api/dms`

#### Response

**Body**

```json
{
  "results": [
    {
      "id": "12345",
      "user": {
        "id": "12345",
        "username": "george.costanza"
      },
      "unread": 0
    }
  ]
}
```

### Create Direct Message

Direct messages are placed in their respective direct message channels.

#### Request `POST /api/dms/{id}/messages`

**URL Params**

* **id**: ID of the direct message channel.

**Body**

```json
{
  "content": "Hello"
}
```

#### Response

**Body**

```json
{
  "id": "12345",
  "content": "Hello"
}
```

#### Response

**Body**

```json
{
  "results": [
    {
      "id": "12345",
      "user": {
        "id": "12345",
        "username": "george.costanza"
      },
      "unread": 0
    }
  ]
}
```

### List Direct Messages

List the messages in a direct message channel.

### Request `GET /api/dms/{id}/messages?last=[str]&limit=[int]`

**URL Params**

* **id**: ID of the direct message channel.

**Query Params**

* **last**: The ID of the last message received.
* **limit**: Maximum number of results to return.

```json
{
  "previous": null,
  "next": "https://localhost:3000/api/channel?last=12345&limit=20",
  "results": [
    {
      "id": "12345",
      "author": {
        "id": "12345",
        "username": "george.costanza"
      },
      "content": "Hello"
    },
    {
      "id": "12345",
      "author": {
        "id": "12345",
        "username": "george.costanza"
      },
      "content": "Hello"
    }
  ]
}
```

If this is the first page of results, the `previous` parameter should be `null`. If there are any other messages that follow the ones returned, then the `next` parameter should contain the full URL, including URL query parameters, that contains the next set of messages. If not, then the `next` parameter should be `null`.
