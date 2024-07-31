
# Twitter Thread Reader

Twitter Thread Reader is a userscript that allows users to read Twitter threads in one single page.

## Installation

To use Twitter Thread Reader, you need to install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/). After installing the userscript manager, click [`here`](https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/twitter-thread-reader.js) to install the userscript.

## Usage

After installing the userscript, go to a Twitter post page and click the "read thread in another page" button in the menu. The userscript will send a GET request to https://twitter-thread.com/api/unroll-thread?id=<threadId> to get all the threads of the current post, and redirect the page to https://twitter-thread.com/t/<threadId> to display the threads in a new page.

## Demo:

![twitter-thread-reader-demo.gif](../assets/twitter-thread-reader-demo.gif)



## How it works?

Thanks for **twitter-thread.com**. I just use it api to create this script.

## Contribution

If you find any issues or have any suggestions for this userscript, feel free to open an issue or submit a pull request on [GitHub](https://github.com/whywhathow/powertoys4browser).

## License

This userscript is licensed under the [MIT License](https://github.com/whywhathow/powertoys4browser/blob/main/LICENSE).

