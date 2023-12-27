import escapeCSS from 'cssesc';

export default function viewTemplate({
  templateId,
  css,
  hash,
  bundleName
}: {
  templateId: string;
  css: string;
  hash: string;
  bundleName: string;
}) {
  return `function elmViewTemplate(model) {
  var modelHTML =  model.__html ? model.__html : '';
  var staticPath = model.component.flags._staticPath;
  var flags = JSON.stringify(model.component.flags);
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
      'oc.require(' +
        '["oc", "elmComponents", "${hash}"],' + 
        '"' + staticPath + '${bundleName}.js",' +
        'function(ElmComponent) {' +
          'var targetNode = document.getElementById("' + templateId + '");' +
          'targetNode.setAttribute("id","");' +
          'ElmComponent({ node: targetNode, flags:' + flags + '});' +
        '}' +
      ');' +
    '});' +
  '</script>'
}`;
}
