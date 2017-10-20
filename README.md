# grid-monitor

## Preparation
Install npm and node [with Homebrew](https://changelog.com/posts/install-node-js-with-homebrew-on-os-x) or download from [nodejs.org](https://nodejs.org/). 

## Installation
> :grey_exclamation: Run following commands in project root directory

Install required modules:
```
npm install node-static
npm install xmlhttprequest
```

## Execution

Start server:
```
node server.js
```

## Usage

Input URLs to grid instances that should be tracked. 
URL expects to return JSON in the following format:
```
{
  "total": 71,
  "used": 0,
  "queued": 0,
  "pending": 0,
  "browsers": { ... }
}
```

Drag `Table refresh rate` slider to change frequency of table updates.
