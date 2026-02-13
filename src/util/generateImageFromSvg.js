/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import { Canvg } from 'canvg';

// list of defined encodings
const ENCODINGS = [
  'image/png',
  'image/jpeg'
];

const OUTPUT_FORMATS = [
  'dataUrl',
  'blob'
];

const INITIAL_SCALE = 3;
const FINAL_SCALE = 1;
const SCALE_STEP = 1;

const DATA_URL_REGEX = /^data:((?:\w+\/(?:(?!;).)+)?)((?:;[\w\W]*?[^;])*),(.+)$/;

/**
 * Generate an image from SVG markup.
 *
 * @param {string} svg
 * @param {{ imageType?: 'png'|'jpeg', outputFormat?: 'dataUrl'|'blob' }} [options]
 *
 * @returns {Promise<string|Blob>}
 */
export default async function generateImageFromSvg(svg, options = {}) {
  const { imageType = 'png', outputFormat = 'dataUrl' } = options;
  const encoding = 'image/' + imageType;

  if (OUTPUT_FORMATS.indexOf(outputFormat) === -1) {
    throw new Error('<' + outputFormat + '> is not supported output format for converting svg to image');
  }

  if (ENCODINGS.indexOf(encoding) === -1) {
    throw new Error('<' + imageType + '> is not supported type for converting svg to image');
  }

  const initialSVG = svg;

  for (let scale = INITIAL_SCALE; scale >= FINAL_SCALE; scale -= SCALE_STEP) {
    try {
      let canvas = document.createElement('canvas');

      svg = scaleSvg(initialSVG, scale);

      const context = canvas.getContext('2d');

      const canvg = Canvg.fromString(context, svg);
      await canvg.render();

      // make the background white for every format
      context.globalCompositeOperation = 'destination-over';
      context.fillStyle = 'white';

      context.fillRect(0, 0, canvas.width, canvas.height);

      if (outputFormat === 'dataUrl') {
        const dataUrl = canvas.toDataURL(encoding);

        if (DATA_URL_REGEX.test(dataUrl)) {
          return dataUrl;
        }
      } else {
        const blob = await new Promise(resolve => {
          canvas.toBlob(result => resolve(result), encoding);
        });

        if (blob) {
          return blob;
        }
      }
    } catch (error) {

      // If rendering or export fails for this scale, try again with a smaller scale.
      continue;
    }
  }

  throw new Error('Error happened generating image. Diagram size is too big.');
}

function scaleSvg(svg, scale) {
  return svg
    .replace(/width="([^"]+)"/, function(match, widthStr) {
      const width = parseFloat(widthStr);

      if (Number.isNaN(width)) {
        return match;
      }

      return `width="${width * scale}"`;
    })
    .replace(/height="([^"]+)"/, function(match, heightStr) {
      const height = parseFloat(heightStr);

      if (Number.isNaN(height)) {
        return match;
      }

      return `height="${height * scale}"`;
    });
}
