import {defineConfig} from 'tsup';

const tsupConfig = defineConfig({
  name: '@koa/etag',
  entry: ['src/*.ts'],
  target: 'esnext',
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: false,
  clean: true,
  platform: 'node',
  cjsInterop: true,
});

export default tsupConfig;
