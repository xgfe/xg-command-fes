# xg-command-fes
xg fes pulgin

## Usage
```shell
cd $project_dir
xg fes
```

### OPTIONS
`XG_FES="config" xg fes --config-env="XG_FES"`
`xg fes --config-file="filepath"`
`XG_FES_REMOTE="url" xg fes --config-remote="XG_FES_REMOTE"`

package-fes.json
```json
{
  "modulesDirname": "src/app/Modules",
  "dependencies": {
    "moduleName": "*",
  }
}
```

.xg.fes.config
```json
{
    "modules": {
        "moduleName": {
            "resolved": "",
            "version": "",
        }
    },
};
```
