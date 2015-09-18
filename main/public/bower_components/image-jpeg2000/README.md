# image-JPEG2000

Support repository for a fork of Mozilla's PDF.js that adds support for 16 bit signed grayscale JPEG2000 images.

## Build

```
git submodule init
git submodule update
npm install
grunt
```

## Usage

```
  jpxImage.parse(jpxData);
  var width = jpxImage.width;
  var height = jpxImage.height;
  var pixelData = tileComponents.items;
```

jpxData: a Uint8 buffer containing the JPEG2000 code-stream.
pixelData: based on whether the codestream is signed or not, either a Int16 or Uint16 buffer containing the decoded data.
