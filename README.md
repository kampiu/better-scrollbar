# better-scrollbar

![NPM License](https://img.shields.io/npm/l/better-scrollbar)
![NPM Version](https://img.shields.io/npm/v/better-scrollbar)
[![Coverage Status](https://coveralls.io/repos/github/kampiu/better-scrollbar/badge.svg?branch=release)](https://coveralls.io/github/kampiu/better-scrollbar?branch=release)

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

The `<Scrollbars>` component is completely customizable. Check out the following code:

```javascript
import React, { Component } from "react"
import ScrollBar from "better-scrollbar"

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

## Examples

Run the simple example:
```bash
# Make sure that you've installed the dependencies
npm install
npm run site:dev
```


## License

MIT
