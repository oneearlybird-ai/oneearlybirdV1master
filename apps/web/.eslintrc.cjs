/**
 * Local ESLint config for apps/web. Marks this as the root to prevent
 * inheriting repo-level plugins that are not installed in this package.
 */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
};

