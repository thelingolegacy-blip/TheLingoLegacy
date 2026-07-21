# TheLingoLegacy — Website Repo

This repo contains the public website skeleton for The Lingo Legacy project.

Folders:
- landing/: simple landing page
- assets/: placeholder logos and images
- docs/: site docs and deployment notes

Contact: dlingo@thelingolegacy.com
# Setting up GitHub Copilot for your enterprise

Enable GitHub Copilot across your enterprise so developers can write code faster.

## Enable GitHub Copilot

To purchase GitHub Copilot for your enterprise, [contact GitHub's Sales team](https://github.com/enterprise/contact?ref_product=copilot\&ref_type=engagement\&ref_style=text).

A member of the Sales team will work with you to set up Copilot for your enterprise.

## Set policies

You will use enterprise policies to manage two aspects of governance:

* **Availability**: Which Copilot features, models, and MCP servers are available in your enterprise?
* **Controls**: What restrictions apply to these features? For example, will you exclude certain files or block suggestions matching public code?

Generally, enterprise owners can either set each policy for the whole enterprise or "let organizations decide." With the latter option, users are subject to the policy of the organization where they receive their Copilot license or to the default defined in your "Policies for enterprise-assigned users" setting.

To manage policies, see [Managing policies and features for GitHub Copilot in your enterprise](/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-enterprise-policies).

## Configure networking

If your corporate network restricts users' traffic, add the required URLs to the allowlist for your firewall or proxy. See [Copilot allowlist reference](/en/copilot/reference/copilot-allowlist-reference).

If you route traffic via a proxy server, you may need to ask users to configure proxy settings in their environment. You may also need to install custom certificates on your users' machines. For more information, see [Network settings for GitHub Copilot](/en/copilot/concepts/network-settings).

If your enterprise is on GHE.com, users will also need to configure their environment to authenticate from their development environment. See [Using GitHub Copilot with an account on GHE.com](/en/copilot/how-tos/configure-personal-settings/authenticate-to-ghecom).

## Assign licenses

There are two main ways to grant access to Copilot in an enterprise:

* **Assign licenses directly to users or teams** in the enterprise. This approach simplifies license management at scale and provides the option of granting Copilot licenses to users who don't consume a GitHub Enterprise license. This approach is currently only available for **Copilot Business** licenses.
* **Enable Copilot for organizations**. This approach allows you to choose Copilot Business or Copilot Enterprise for individual organizations and give organization owners control to grant licenses to the users who need them most.

For instructions, see [Granting users access to GitHub Copilot in your enterprise](/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-access/grant-access).


## Payments

The site includes a Stripe Checkout payment page at `/payments/` for one-time credit-card payments. Configure `STRIPE_SECRET_KEY`, `STRIPE_ONE_TIME_PRICE_ID`, and `SITE_URL` in Vercel before launch. Add `STRIPE_SUBSCRIPTION_PRICE_ID` when subscription billing is ready.
