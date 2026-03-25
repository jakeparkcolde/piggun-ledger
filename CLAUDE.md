# simple-account

소상공인을 위한 간편 세무장부 (Simple Tax/Accounting Ledger for Small Business Owners)

## Project Overview

Target user: 김영규 (피그건 대표) - manages both a corporate entity and personal business.
Core concept: Reverse tax calculation ("역산형" 세무장부) - input desired tax amount, auto-calculate required expenses.

Spec document: @simple account.md

## Tech Stack

- React (JSX single file) + Tailwind CSS
- recharts (charts/graphs)
- lucide-react (icons)
- Data: JSON export/import (no localStorage, no backend)

## Key Conventions

- Language: Korean UI, Korean code comments
- Monthly input cycle (월 1회 정산)
- Dual-tab structure: 법인 (corporate) / 개인 (personal)
- All amounts in KRW

## MoAI Integration

- SPEC workflow: /moai plan -> /moai run -> /moai sync
- Quality: TRUST 5 principles
- Config: @.moai/config/sections/
