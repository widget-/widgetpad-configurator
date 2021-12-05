const plugins = [
  [
    'babel-plugin-direct-import',
    { modules: ['@mui/material', '@mui/icons-material'] }
  ]
];


const presets = [
  "react-app"
];

module.exports = { presets, plugins };
