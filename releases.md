# Release Process for Unapologetic Packages

_If you've made a change to an Unapologetic package which requires a new release, follow these steps to complete the release process._

---

## Commit a new version

- Once your release-ready changes have been accepted and merged into `master`, create a new commit titled `Bump version to [version_number]` (e.g. `Bump version to 2.0.0`) which includes only a single change: bumping the version number in `package.json`. Submit a pull request with only this commit.
- Wait for your pull request to be merged

## Tag a new release for the version

- Checkout `master` at the point of your merged version bump pull request
- Run `git tag -a v[version_number]` (e.g. `get tag -a v2.0.0`)
- Input and save a full description of the changes included in this new version
- Run `git push origin v[version_number]` to push the tagged release to your fork
- Check the tagged release on your fork to make sure everything looks good
- Run `git push upstream v[version_number]` to push the tagged release to the official repository

## Publish a `beta` tag of the new release to `npm`
- `cd` to the top level directory of the repository
- Checkout the tagged release that you intend to publish
    - `git checkout v[version_number]`
    - `git` should report that you are now in a "detached HEAD" state
- Dry run the publish command
    - `npm publish --tag beta --dry-run`
- Verify the dry run data looks accurate to what you intend to publish
- Run the publish command to push the beta release to the `unplgtc` `npm` registry
    - `npm publish --tag beta`
- Check yourself back into `master`
    - `git checkout master`

## Update the `latest` tag of the package to match the `beta` release on `npm`
- Once your `beta` version is ready for production, we can update the package's `latest` tag to use your release
- Run `npm dist-tag ls` and make sure you see the correct `beta` tag and version listed
- Run `npm dist-tag add @unplgtc/[package-name]@[beta_version] latest`
    - (e.g. `npm dist-tag add @unplgtc/http-request@2.0.0 latest` to update the `latest` tag of Unapologetic's `http-request` package to version `2.0.0`)
- Run `npm dist-tag ls` again and make sure the versions of the `latest` and `beta` tags now match up
