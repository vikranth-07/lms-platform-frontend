import React from 'react';
import Avatar from '@mui/material/Avatar';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import GroupsIcon from '@mui/icons-material/Groups';
import HubIcon from '@mui/icons-material/Hub';
import InsightsIcon from '@mui/icons-material/Insights';
import LanIcon from '@mui/icons-material/Lan';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import StorageIcon from '@mui/icons-material/Storage';
import TerminalIcon from '@mui/icons-material/Terminal';
import { getLmsIconKey } from '../utils/lmsMetadata';

const iconMap = {
  account_tree: AccountTreeIcon,
  architecture: ArchitectureIcon,
  auto_stories: AutoStoriesIcon,
  cloud: CloudQueueIcon,
  cloud_queue: CloudQueueIcon,
  code: CodeIcon,
  data_object: DataObjectIcon,
  developer_board: DeveloperBoardIcon,
  fact_check: FactCheckIcon,
  groups: GroupsIcon,
  hub: HubIcon,
  insights: InsightsIcon,
  integration_instructions: CodeIcon,
  lan: LanIcon,
  menu_book: MenuBookIcon,
  psychology: PsychologyIcon,
  school: SchoolIcon,
  security: SecurityIcon,
  settings_ethernet: SettingsEthernetIcon,
  storage: StorageIcon,
  terminal: TerminalIcon,
};

const LmsIcon = ({ item, size = 42 }) => {
  const iconKey = getLmsIconKey(item);
  const Icon = iconMap[iconKey] || MenuBookIcon;

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        backgroundColor: item?.brandColor || 'primary.main',
        color: '#FFFFFF',
        flexShrink: 0,
      }}
    >
      <Icon fontSize={size > 36 ? 'medium' : 'small'} />
    </Avatar>
  );
};

export default LmsIcon;
