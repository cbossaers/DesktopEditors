# Offline branding overlay for DesktopEditors (Linux only)

This directory contains a build-time overlay that turns ONLYOFFICE/Euro-Office
DesktopEditors into a fully offline local document editor on Linux.

The overlay is applied by `.github/workflows/main.yml` **before** the Docker
bake build. It intentionally does **not** modify any Git submodule contents at
rest; upstream `core/`, `desktop-apps/` and `web-apps/` remain 1:1 with their
remote counterparts.

## What is disabled/blanked

| Feature | File(s) | Effect |
|---|---|---|
| Product website / signup / download / release notes / AGPL links | `desktop-apps/win-linux/src/defines.h` | URLs are empty strings, so menu items that open them become no-ops |
| Help-center link on the start page | `desktop-apps/common/loginpage/src/panelrecent.js` | Rendered as plain text instead of an external link |
| Online templates gallery | `desktop-apps/common/loginpage/src/paneltemplates.js` | Empty domain prevents any network `fetch` |
| Registration / password-recovery links | `desktop-apps/common/loginpage/src/utils.js` | Links are empty |
| Plugin store / remote plugin installs | `desktop-sdk/ChromiumBasedEditors/plugins/manager/code.js` | Only locally installed plugins are shown; remote store list is ignored |
| Automatic update checks | `.github/workflows/main.yml` env + `desktop-apps.bake.Dockerfile` | `DESKTOP_URL_UPDATES_*` are empty strings, so update daemon appcast URLs are blank |
| Cloud portal creation from launcher | `desktop-apps/package/common/linux/desktopeditors.desktop.m4` | `--lock-portals` is added to all `.desktop` `Exec` lines |
| vcpkg binary cache / 3rd-party downloads | `core/.docker/core.bake.Dockerfile` + `main.yml` | `VCPKG_BINARY_REMOTE` defaults to empty; point it at your own mirror if needed |

## Files in this overlay

```
branding/offline/
├── README.md
├── .docker/
│   ├── core/core.bake.Dockerfile                    # forwards VCPKG_BINARY_REMOTE
│   ├── desktop-apps/desktop-apps.bake.Dockerfile    # applies source overlays + appcast env
│   ├── desktop-apps/desktop-js.bake.Dockerfile      # applies loginpage JS overlay before grunt
│   └── web-apps/web-apps.bake.Dockerfile              # applies web-apps source overlay before grunt
├── desktop-apps/
│   ├── common/loginpage/src/panelrecent.js          # no external help link
│   ├── common/loginpage/src/paneltemplates.js       # no online templates
│   ├── common/loginpage/src/utils.js                # no registration links
│   ├── package/common/linux/desktopeditors.desktop.m4 # --lock-portals etc.
│   └── win-linux/src/defines.h                      # blank external URLs
└── desktop-sdk/
    └── ChromiumBasedEditors/plugins/manager/code.js   # local plugins only
```

## How it is applied in CI

`.github/workflows/main.yml`:

1. Checks out the repo with submodules recursively.
2. Applies the upstream V8 fix overlay (existing project-specific step).
3. Validates that all expected overlay files exist.
4. Copies `branding/offline/.docker/...` over the upstream submodule
   Dockerfiles:
   - `core/.docker/core.bake.Dockerfile`
   - `desktop-apps/.docker/desktop-apps.bake.Dockerfile`
   - `desktop-apps/.docker/desktop-js.bake.Dockerfile`
   - `web-apps/.docker/web-apps.bake.Dockerfile`
5. Exports `BRANDING_DIR=branding/offline`,
   `VCPKG_BINARY_REMOTE=""`, `DESKTOP_URL_UPDATES_MAIN_CHANNEL=""`,
   `DESKTOP_URL_UPDATES_DEV_CHANNEL=""` and runs `build/linux/build.sh`.

The patched Dockerfiles then `COPY ${BRANDING_DIR}/...` over the corresponding
upstream source trees *inside* the build containers, so the compiled binaries
reflect the offline configuration.

## Keeping the overlay up to date

When you rebase the fork onto a newer upstream version, the overlay files may
need to be refreshed if upstream changed the surrounding context. The safest way
to update is:

1. Copy the new upstream file into the overlay.
2. Re-apply the small offline changes (blank URLs, disable remote features,
   add `BRANDING_DIR`/`VCPKG_BINARY_REMOTE`/appcast `ARG`+`ENV` hooks).
3. Re-validate with `grep -R 'https\?://' branding/offline/` that no
   application-level external URLs remain.

## Scope

This overlay only targets the **Linux** build path and only the runtime
application URLs/control paths. Build-time Docker commands (NodeSource setup,
vcpkg clone, LLVM apt repository) are left unchanged; they only affect the build
host and can be replaced with internal mirrors separately if your *build* must
also be air-gapped.

CEF/Chromium background traffic (component updates, CRL checks, safe browsing)
is not addressed here because it is controlled by CEF build flags, not by the
application source code in this repository.
