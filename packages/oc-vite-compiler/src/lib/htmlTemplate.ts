import escapeCSS from 'cssesc';

export interface HtmlTemplate {
  templateId: string;
  templateName: string;
  css: string;
  externals: Array<{
    name: string;
    global: string;
  }>;
  bundle: string;
  hash: string;
}

export default function htmlTemplate({
  templateId,
  templateName,
  externals,
  css,
  bundle,
  hash,
}: HtmlTemplate) {
  return `function(model){
  oc.${templateName}Components = oc.${templateName}Components || {};
  oc.${templateName}Components['${hash}'] = oc.${templateName}Components['${hash}'] || (${bundle});
  if (!model) return;
  var modelHTML =  model.__html ? model.__html : '';
  var staticPath = model.component.props._staticPath;
  var props = JSON.stringify(model.component.props);
  oc = oc || {};
  oc.__${templateName}Template = oc.__${templateName}Template || { count: 0 };
  var count = oc.__${templateName}Template.count;
  var templateId = "${templateId}-" + count;
  oc.__${templateName}Template.count++;
  return '<div id="' + templateId + '" class="${templateId}">' + modelHTML + '</div>' +
    '${css ? '<style>' + escapeCSS(css) + '</style>' : ''}' +
    '<script>' +
    'oc = oc || {};' +
    'oc.cmd = oc.cmd || [];' +
    'oc.cmd.push(function(oc){' +
    '${css ? "oc.events.fire(\\'oc:cssDidMount\\', \\'" + css + "\\');" : ''}' +
      'oc.requireSeries(${JSON.stringify(externals)}, function(){' +
        'var targetNode = document.getElementById("' + templateId + '");' +
        'targetNode.setAttribute("id","");' +
        'oc.${templateName}Components["${hash}"](' + props + ', targetNode, ' + !!modelHTML  + ');' +
      '});' +
    '});' +
  '</script>'
}`;
}
