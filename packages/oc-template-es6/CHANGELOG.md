# oc-template-es6

## 2.0.0

### Major Changes

- Fix SSR in es6 and create specific html that removes unneeded elements
  It's a breaking change because in cases where the template has no css the element will have no inner div container
  Not needed because there is no need to target it only to replace html without affecting styles
