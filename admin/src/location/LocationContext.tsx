import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { locationApi } from '../api/resources';
import { useAuth } from '../auth/AuthContext';
import { ROLES, type Block, type District, type Village } from '../types';

interface LocationContextValue {
  districts: District[];
  blocks: Block[];
  villages: Village[];
  districtId: string;
  blockId: string;
  villageId: string;
  /** True for local admins — locality is fixed to their assigned village. */
  locked: boolean;
  setDistrictId: (id: string) => void;
  setBlockId: (id: string) => void;
  setVillageId: (id: string) => void;
  reloadDistricts: () => void;
  reloadBlocks: () => void;
  reloadVillages: () => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

const LS_DISTRICT = 'nattile_admin_district';
const LS_BLOCK = 'nattile_admin_block';
const LS_VILLAGE = 'nattile_admin_village';

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Local admins are pinned to their own village; super admins roam freely.
  const locked = user?.role === ROLES.LOCAL_ADMIN;

  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [districtId, setDistrictIdState] = useState(
    () => (locked ? user?.district ?? '' : localStorage.getItem(LS_DISTRICT) ?? '')
  );
  const [blockId, setBlockIdState] = useState(
    () => (locked ? user?.block ?? '' : localStorage.getItem(LS_BLOCK) ?? '')
  );
  const [villageId, setVillageIdState] = useState(
    () => (locked ? user?.village ?? '' : localStorage.getItem(LS_VILLAGE) ?? '')
  );

  const loadDistricts = () => {
    locationApi.listDistricts().then((res) => {
      setDistricts(res.data);
      if (!locked) setDistrictIdState((current) => current || res.data[0]?._id || '');
    });
  };

  const loadBlocks = (dId: string) => {
    if (!dId) return setBlocks([]);
    locationApi.listBlocks(dId).then((res) => {
      setBlocks(res.data);
      if (!locked) setBlockIdState((current) => current || res.data[0]?._id || '');
    });
  };

  const loadVillages = (bId: string) => {
    if (!bId) return setVillages([]);
    locationApi.listVillages(bId).then((res) => {
      setVillages(res.data);
      if (!locked) setVillageIdState((current) => current || res.data[0]?._id || '');
    });
  };

  useEffect(loadDistricts, []);
  useEffect(() => loadBlocks(districtId), [districtId]);
  useEffect(() => loadVillages(blockId), [blockId]);

  const setDistrictId = (id: string) => {
    if (locked) return;
    setDistrictIdState(id);
    localStorage.setItem(LS_DISTRICT, id);
    setBlockIdState('');
    setVillageIdState('');
    localStorage.removeItem(LS_BLOCK);
    localStorage.removeItem(LS_VILLAGE);
  };

  const setBlockId = (id: string) => {
    if (locked) return;
    setBlockIdState(id);
    if (id) localStorage.setItem(LS_BLOCK, id);
    else localStorage.removeItem(LS_BLOCK);
    setVillageIdState('');
    localStorage.removeItem(LS_VILLAGE);
  };

  const setVillageId = (id: string) => {
    if (locked) return;
    setVillageIdState(id);
    if (id) localStorage.setItem(LS_VILLAGE, id);
    else localStorage.removeItem(LS_VILLAGE);
  };

  const value = useMemo(
    () => ({
      districts,
      blocks,
      villages,
      districtId,
      blockId,
      villageId,
      locked,
      setDistrictId,
      setBlockId,
      setVillageId,
      reloadDistricts: loadDistricts,
      reloadBlocks: () => loadBlocks(districtId),
      reloadVillages: () => loadVillages(blockId),
    }),
    [districts, blocks, villages, districtId, blockId, villageId, locked]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLocationScope(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationScope must be used within LocationProvider');
  return ctx;
}
