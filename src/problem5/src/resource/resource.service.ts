import { Resource } from "./models/resource.model";
import {CreateResourceDto, UpdateResourceDto} from "./dto/resource.dto";

export const createResource = async (data: CreateResourceDto) => {
    return Resource.create(data);
};

export const getAllResources = async ({ name, skip = "0", take = "10" }: any) => {
    const filter: any = { deletedAt: null };
    if (name) {
        filter.name = name;
    }
    const [data, total] = await Promise.all([
        Resource.find(filter).skip(Number(skip) || 0).limit(Number(take) || 10),
        Resource.countDocuments(filter)
    ]);
    return { data, total, skip: Number(skip), take: Number(take) };
};

export const deleteResource = async (id: string) => {
    return Resource.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
};

export const getResourceById = async (id: string) => {
    return Resource.findOne({ _id: id, deletedAt: null });
};

export const updateResource = async (id: string, data: UpdateResourceDto) => {
    return Resource.findOneAndUpdate({ _id: id, deletedAt: null }, data, { new: true });
};
