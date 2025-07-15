import { getInfo } from 'oc-template-es6';
import { createCompile } from 'oc-vite-compiler';

import escapeCSS from 'cssesc';

export interface HtmlTemplate {
  templateId: string;
  templateName: string;
  css: string;
  externals: Array<{
    name: string;
    global: string;
  }>;
  hash: string;
  bundle: string;
}

export function htmlTemplate({
  templateId,
  templateName,
  externals,
  css,
  bundle,
  hash,
}: HtmlTemplate) {
  return `function(model){
  oc.${templateName}Components = oc.${templateName}Components || {};
  oc.${templateName}Components['${hash}'] = (${bundle});
  if (!model) return;
  var modelHTML =  model.__html ? model.__html : '';
  var ssr = !!modelHTML;
  var externals = ${JSON.stringify(externals)};
  var staticPath = model.component.props._staticPath;
  var props = JSON.stringify(model.component.props);
  oc = oc || {};
  oc.__${templateName}Template = oc.__${templateName}Template || { count: 0 };
  oc.__data = oc.__data || {};
  oc.__data[model.id] = model.component.props;
  var count = oc.__${templateName}Template.count;
  var templateId = "${templateId}-" + count;
  oc.__${templateName}Template.count++;
  var renderScript = '<script>' +
    'oc = oc || {};' +
    'oc.cmd = oc.cmd || [];' +
    'oc.cmd.push(function(oc){' +
    '${css ? "oc.events.fire(\\'oc:cssDidMount\\', \\'" + css + "\\');" : ''}' +
      'oc.requireSeries(' + JSON.stringify(externals) + ', function(){' +
        'var targetNode = document.getElementById("' + ${
          css ? 'templateId' : 'model.id'
        } + '");' +
        'oc.components["${hash}"]({ id: "' + model.id + '", component: { props: oc.__data["' + model.id + '"]} });' +
        'oc.${templateName}Components["${hash}"](oc.__data["' + model.id + '"], targetNode, ' + !!modelHTML  + ');' +
      '});' +
    '});' +
  '</script>';
  var wrappedHtml = '<div id="' + templateId + '" class="${templateId}">' + modelHTML + '</div>';

  return ${css ? 'wrappedHtml' : 'modelHTML'} +
    '${css ? '<style>' + escapeCSS(css) + '</style>' : ''}' +
    (ssr ? '' : renderScript)
}`;
}

export const compile = createCompile({
  htmlTemplate,
  getInfo: getInfo as any,
});
