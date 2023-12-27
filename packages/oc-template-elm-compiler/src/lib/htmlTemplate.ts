import escapeCSS from 'cssesc';

export default function viewTemplate({
  templateId,
  css,
  hash,
  bundle
}: {
  templateId: string;
  css: string;
  hash: string;
  bundle: string;
}) {
  return `function(model){
  oc.elmComponents = oc.elmComponents || {};
  oc.elmComponents['${hash}'] = oc.elmComponents['${hash}'] || (${bundle});
  if (!model) return;
  var modelHTML =  model.__html ? model.__html : '';
  var staticPath = model.component.props._staticPath;
  var props = JSON.stringify(model.component.props);
  window.oc = window.oc || {};
  window.oc.__elmTemplate = window.oc.__elmTemplate || { count: 0 };
  var count = window.oc.__elmTemplate.count;
  var templateId = "${templateId}-" + count;
  window.oc.__elmTemplate.count++;
  return '<div id="' + templateId + '" class="${templateId}">' + modelHTML + '</div>' +
    '${css ? '<style>' + escapeCSS(css) + '</style>' : ''}' +
    '<script>' +
    'window.oc = window.oc || {};' +
    'oc.cmd = oc.cmd || [];' +

    'oc.cmd.push(function(oc){' +
    '${css ? "oc.events.fire(\\'oc:cssDidMount\\', \\'" + css + "\\');" : ''}' +
      'var targetNode = document.getElementById("' + templateId + '");' +
      'targetNode.setAttribute("id","");' +
      'oc.elmComponents["${hash}"](' + props + ', targetNode);' +
    '});' +
  '</script>'
}`;
}
