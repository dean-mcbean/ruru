*Any questions, ask Dean.*

## General Structure:
1. `./dispatch` contains outgoing actions
2. `./fetch` contains outgoing requests
3. `./routes` handles incoming requests
4. `./utils` contains reusable functions

Most logic lies in the above folders.

## Connections
Ruru currently connects to six different services:
 - Slack
 - Github
 - Motion
 - Basecamp
 - Runn
 - ...and MongoDB (locally, for persistent storage)