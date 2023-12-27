const viewTemplate = ({
  elmRoot,
  css,
  bundleHash,
  bundleName
}) => `function elmViewTemplate(model) {
  var modelHTML =  model.__html ? model.__html : '';
  var staticPath = model.elmComponent.flags._staticPath;
  var flags = JSON.stringify(model.elmComponent.flags);
  window.oc = window.oc || {};
  window.oc.__elmTemplate = window.oc.__elmTemplate || { count: 0 };
  var count = window.oc.__elmTemplate.count;
  var templateId = "${elmRoot}-" + count;
  window.oc.__elmTemplate.count++;
  return '<div id="' + templateId + '" class="${elmRoot}">' + modelHTML + '</div>' +
    '${css ? '<style>' + css + '</style>' : ''}' +
    '<script>' +
    'window.oc = window.oc || {};' +
    'oc.cmd = oc.cmd || [];' +
    'oc.cmd.push(function(oc){' +
    '${css ? "oc.events.fire(\\'oc:cssDidMount\\', \\'" + css + "\\');" : ''}' +
      'oc.require(' +
        '["oc", "elmComponents", "${bundleHash}"],' + 
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

module.exports = viewTemplate;
