# Security Policy

## This project is intentionally vulnerable

VulnShop-Lab is an educational project. The `lab/*` branches contain
**deliberate** security vulnerabilities so that people can learn how
attacks work and how to fix them.

- **Never expose this application to the internet.**
- Run it only on your own machine (`127.0.0.1`).
- Practice attacks only on this project or on legal training platforms
  (for example PortSwigger Web Security Academy or TryHackMe).
- Never use these techniques against systems you do not own or do not
  have written permission to test.

## What is NOT a vulnerability report

Vulnerabilities in any `lab/*/before-fix` branch are intentional.
Please do not report them. They are the exercises.

## What IS a vulnerability report

Please report a problem if you find a security issue in:

- the `main` branch (the secure version), or
- an `after-fix` branch, where the fix is incomplete or can be bypassed, or
- the CI workflows or repository configuration (for example a leaked secret).

## How to report

Use GitHub's **Report a vulnerability** button in the Security tab of this
repository (private vulnerability reporting). Please do not open a public
issue for a real vulnerability.

I will try to reply within a reasonable time, but this is a personal learning
project and there is no guaranteed response time.

## Supported versions

Only the `main` branch is maintained.