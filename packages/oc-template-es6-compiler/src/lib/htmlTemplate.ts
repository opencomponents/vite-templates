import escapeCSS from 'cssesc';

export function htmlTemplate({ css, bundle }: { css: string; bundle: string }) {
  return `function(model){
  const fn = ${bundle};
  return '' + 
    fn(model.component.props) +
    '${
      css
        ? '<style>' +
          escapeCSS(css) +
          '</style>' +
          '<script>' +
          'window.oc = window.oc || {};' +
          'oc.cmd = oc.cmd || [];' +
          'oc.cmd.push(function(oc){' +
          "oc.events.fire(\\'oc:cssDidMount\\', \\'" +
          css +
          "\\');" +
          '});' +
          '</script>'
        : ''
    }'
      
}`;
}
