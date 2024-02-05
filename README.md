# better-scrollbar

![NPM License](https://img.shields.io/npm/l/better-scrollbar)
![NPM Version](https://img.shields.io/npm/v/better-scrollbar)
[![Coverage Status](https://coveralls.io/repos/github/kampiu/better-scrollbar/badge.svg?branch=master)](https://coveralls.io/github/kampiu/better-scrollbar?branch=master)

Highly customizable, high-performance virtual list for big data rendering.

Feel free to provide feedback if there are any issues, and promptly synchronize problem handling.

## Installation
```bash
npm install better-scrollbar --save
```

## Usage

```javascript
import React, { Component } from "react"
import ScrollBar from "better-scrollbar"
import "better-scrollbar/dist/BetterScrollbar.min.css"

class App extends Component {
  render() {
    return (
      <ScrollBar style={{ width: 500, height: 300 }}>
        <p>Some great content...</p>
      </ScrollBar>
    )
  }
}
```

The `<ScrollBar>` component is completely customizable. Check out the following code:

```javascript
import React, { Component } from "react"
import ScrollBar from "better-scrollbar"
import "better-scrollbar/dist/BetterScrollbar.min.css"

class CustomScrollBar extends Component {
  render() {
    return (
      <ScrollBar
        width={this.props.width}
        height={this.props.height}
        onScroll={this.handleScroll}
        onScrollStart={this.handleScrollStart}
        onScrollEnd={this.handleScrollEnd}
        renderView={this.renderView}
        renderTrackHorizontal={this.renderTrackHorizontal}
        renderTrackVertical={this.renderTrackVertical}
        renderThumbHorizontal={this.renderThumbHorizontal}
        renderThumbVertical={this.renderThumbVertical}
        scrollBarHidden
        scrollBarAutoHideTimeout={1000}
        {...this.props}
      />
    )
  }
}
```

### If you are a tree level structure, you can use the following code:

```tsx
import React from "react"
import ScrollBar from "better-scrollbar"
import "better-scrollbar/dist/BetterScrollbar.min.css"

interface Node {
  id: string
  name: string
  next?: Array<Node>
}

const renderList = (props: Node): Array<JSX.Element> => {
  const component = <div>{ props.name }</div>
  const nodesList = [component]

  if (props?.next && props?.next) {
    props?.next?.map((node) => nodesList.push(...renderList(node)))
  }
  return nodesList
}

export default () => {
  const tree: Node = {id: "1", name: "demo"}
  return (
    <div>
      <ScrollBar width={ 500 } height={ 200 }>
        { renderList(tree) }
      </ScrollBar>
    </div>
  )
}
```

## Examples

Run the simple example:
```bash
# Make sure that you've installed the dependencies
npm install
npm run site:dev
```


## License

MIT
