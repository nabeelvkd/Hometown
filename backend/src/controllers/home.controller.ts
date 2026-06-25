import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { getHomeData } from '../services/home.service';

export const getHome = async (req: Request, res: Response) => {
  const { villageId, districtId, blockId } = req.query as {
    villageId?: string;
    districtId?: string;
    blockId?: string;
  };
  const data = await getHomeData({ villageId, districtId, blockId });
  sendSuccess(res, data);
};
