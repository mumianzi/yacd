import cx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';
import { Info } from 'react-feather';
import {
  FcAreaChart,
  FcDocument,
  FcGlobe,
  FcLink,
  FcRuler,
  FcSettings,
} from 'react-icons/fc';
import { Link, useLocation } from 'react-router-dom';

import { framerMotionResouce } from '../misc/motion';
import { getTheme, switchTheme } from '../store/app';
import s from './SideBar.module.css';
import { connect } from './StateProvider';

const { useCallback } = React;

// testing color icons

// const icons = {
//   activity: Activity,
//   globe: Globe,
//   command: Command,
//   file: File,
//   settings: Settings,
//   link: Link2
// };

const icons = {
  activity: FcAreaChart,
  globe: FcGlobe,
  command: FcRuler,
  file: FcDocument,
  settings: FcSettings,
  link: FcLink,
};

const SideBarRow = React.memo(function SideBarRow({
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'isActive' does not exist on type '{ chil... Remove this comment to see the full error message
  isActive,
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'to' does not exist on type '{ children?:... Remove this comment to see the full error message
  to,
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'iconId' does not exist on type '{ childr... Remove this comment to see the full error message
  iconId,
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'labelText' does not exist on type '{ chi... Remove this comment to see the full error message
  labelText,
}) {
  const Comp = icons[iconId];
  const className = cx(s.row, isActive ? s.rowActive : null);
  return (
    <Link to={to} className={className}>
      <Comp />
      <div className={s.label}>{labelText}</div>
    </Link>
  );
});

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'Named... Remove this comment to see the full error message
SideBarRow.propTypes = {
  isActive: PropTypes.bool.isRequired,
  to: PropTypes.string.isRequired,
  iconId: PropTypes.string,
  labelText: PropTypes.string,
};

const pages = [
  {
    to: '/',
    iconId: 'activity',
    labelText: 'Overview',
  },
  {
    to: '/proxies',
    iconId: 'globe',
    labelText: 'Proxies',
  },
  {
    to: '/rules',
    iconId: 'command',
    labelText: 'Rules',
  },
  {
    to: '/connections',
    iconId: 'link',
    labelText: 'Conns',
  },
  {
    to: '/configs',
    iconId: 'settings',
    labelText: 'Config',
  },
  {
    to: '/logs',
    iconId: 'file',
    labelText: 'Logs',
  },
];

function SideBar({ dispatch, theme }) {
  const location = useLocation();
  const switchThemeHooked = useCallback(() => {
    dispatch(switchTheme());
  }, [dispatch]);
  return (
    <div className={s.root}>
      <div className={s.logoPlaceholder} />
      <div className={s.rows}>
        {pages.map(({ to, iconId, labelText }) => (
          <SideBarRow
            key={to}
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ key: string; to: string; isActive: boolean... Remove this comment to see the full error message
            to={to}
            isActive={location.pathname === to}
            iconId={iconId}
            labelText={labelText}
          />
        ))}
      </div>
      <div className={s.footer}>
        <button
          className={cx(s.iconWrapper, s.themeSwitchContainer)}
          onClick={switchThemeHooked}
        >
          {theme === 'light' ? <MoonA /> : <Sun />}
        </button>
        <Link to="/about" className={s.iconWrapper}>
          <Info size={20} />
        </Link>
      </div>
    </div>
  );
}

function MoonA() {
  const module = framerMotionResouce.read();
  const motion = module.motion;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        initial={{ rotate: -30 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.7 }}
      />
    </svg>
  );
}

function Sun() {
  const module = framerMotionResouce.read();
  const motion = module.motion;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <motion.g
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </motion.g>
    </svg>
  );
}

const mapState = (s) => ({ theme: getTheme(s) });
export default connect(mapState)(SideBar);
