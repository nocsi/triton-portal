Triton-Portal

### Details
Forked from [sdc-browser-portal](https://git.fm/zllovesuki/sdc-browser-portal/)

I needed a front-end to Joyent Triton without exposing the operator's portal. `zilovesuki` had a suitable front-end created that was purely in-browser so I've appropriated it. The alternative is to use the triton-portal that was created from Faithlife. However, that implementation necessitates oAuth and associated upkeep with that. For the most part I needed a quick solution. The original implementation did not support sub-users, so I've had to fix the pathing on that. The whole goal was to have more finite control over granting access to resources - we're still limited in many ways - but at the base-level, we can now provision sub-user accounts and define the RBACs that way.

Otherwise, I'm pushing this up because of the soup-kitchen forking. The portal works by proxying requests to the cloudAPI endpoints, and thus you'll need to include a cert. There is also a rewrite on the date header so even moreso, you will require a cert on the nginx service.

### RBAC Controls

This is upcoming, but I'll have to implement an UI that makes it easier to grant users access to resources held by the operator user. It's a race right now on whether I wait for the triton-cli to expose those accesses or rely on sdc-chmod.

### Soup-Kitchen

Soup-kitchen is a forking of this project that is geared more towards being a front-end for security operations/analysis/fuzzing/malware/auditing etc. I'll downstream the feature-setthat has been introduced in that project to here. Useful stuff such as in-browser shell to a docker instance/triton machine instance. 

#### Browser Machine/Docker Shell Console

* TBD

#### Terraform

* TBD

### Authentication

I've included a rudimentary in-browser oauth stub. In the future, I'll have to downstream my mechanism for Oauthing and grabbing the RSA/SSH keys out of a vault instead of having the sub-user input their key.