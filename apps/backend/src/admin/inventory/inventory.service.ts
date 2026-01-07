import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FulfillmentStrategy, LocationType, Prisma } from '@repo/database';
import {
  AdminInventoryTableQuery,
  AdminInventoryTableReturnType,
  FulfillmentStrategyOutput,
  InventoryLocationZodSchemaType,
  Pagination,
} from '@repo/types';
import { HelperService } from 'src/common/services/helper.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetFulfillmentStrategiesQueryDto } from './inventory.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  async upsertInventoryLocation(data: InventoryLocationZodSchemaType) {
    const { serviceZones, ...locationInput } = data;

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const locationData =
          await this.helperService.getLocationWithCoordinates({
            countryType: locationInput.countryType,
            countryId: locationInput.countryId,
            stateId: locationInput.stateId,
            cityId: locationInput.cityId,
            districtId: locationInput.districtId,
          });

        const location = await tx.inventoryLocation.upsert({
          where: {
            id: locationInput.uniqueId,
          },
          create: {
            id: locationInput.uniqueId,
            name: locationInput.name,
            type: locationInput.type,
            isActive: locationInput.isActive,
            addressLine1: locationInput.addressLine1,
            addressLine2: locationInput.addressLine2,
            zipCode: locationInput.zipCode,
            contactName: locationInput.contactName,
            contactEmail: locationInput.contactEmail,
            contactPhone: locationInput.contactPhone,
            ...locationData,
          },
          update: {
            name: locationInput.name,
            type: locationInput.type,
            isActive: locationInput.isActive,
            addressLine1: locationInput.addressLine1,
            addressLine2: locationInput.addressLine2,
            zipCode: locationInput.zipCode,
            contactName: locationInput.contactName,
            contactEmail: locationInput.contactEmail,
            contactPhone: locationInput.contactPhone,
            ...locationData,
          },
        });

        await tx.inventoryLocationServiceZone.deleteMany({
          where: {
            locationId: location.id,
          },
        });

        if (serviceZones && serviceZones.length > 0) {
          await tx.inventoryLocationServiceZone.createMany({
            data: serviceZones.map((zone, index) => ({
              locationId: location.id,
              countryId: zone.countryId,
              countryType: zone.countryType,
              stateIds: zone.stateIds || [],
              cityIds: zone.cityIds || [],
              priority: zone.priority ?? index,
              estimatedDeliveryDays: zone.estimatedDeliveryDays,
            })),
          });
        }

        return tx.inventoryLocation.findUnique({
          where: { id: location.id },
          include: {
            serviceZones: {
              orderBy: { priority: 'asc' },
            },
            country: true,
            state: true,
            city: true,
            district: true,
          },
        });
      });
    } catch (error) {
      console.error('Inventory location upsert error:', error);
      throw new InternalServerErrorException(
        'Stok lokasyonu eklenirken/güncellenirken bir hata oluştu.',
      );
    }
  }

  async getInventoryLocations(
    page: number,
    limit: number,
    search?: string,
    type?: LocationType,
  ): Promise<AdminInventoryTableReturnType> {
    try {
      const skip = (page - 1) * limit;

      const whereClause: Prisma.InventoryLocationWhereInput = {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { city: { name: { contains: search, mode: 'insensitive' } } },
            { state: { name: { contains: search, mode: 'insensitive' } } },
            { contactName: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(type && { type }),
      };

      const [inventoryLocations, total] = await Promise.all([
        this.prismaService.inventoryLocation.findMany({
          skip,
          take: limit,
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          include: AdminInventoryTableQuery,
        }),
        this.prismaService.inventoryLocation.count({ where: whereClause }),
      ]);

      return {
        data: inventoryLocations,
        pagination: {
          currentPage: page,
          perPage: limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Stok lokasyonları getirilirken bir hata oluştu.',
      );
    }
  }

  async getInventoryLocationById(
    id: string,
  ): Promise<InventoryLocationZodSchemaType> {
    try {
      const inventoryLocation =
        await this.prismaService.inventoryLocation.findUnique({
          where: { id },
          include: AdminInventoryTableQuery,
        });
      if (!inventoryLocation) {
        throw new BadRequestException('Stok lokasyonu bulunamadı.');
      }
      return {
        countryId: inventoryLocation.countryId,
        countryType: inventoryLocation.country.type,
        isActive: inventoryLocation.isActive,
        name: inventoryLocation.name,
        type: inventoryLocation.type,
        uniqueId: inventoryLocation.id,
        addressLine1: inventoryLocation.addressLine1,
        addressLine2: inventoryLocation.addressLine2,
        cityId: inventoryLocation.cityId || null,
        stateId: inventoryLocation.stateId || null,
        districtId: inventoryLocation.districtId || null,
        contactEmail: inventoryLocation.contactEmail || null,
        contactName: inventoryLocation.contactName || null,
        contactPhone: inventoryLocation.contactPhone || null,
        zipCode: inventoryLocation.zipCode || null,
        serviceZones:
          inventoryLocation.serviceZones.map((zone) => ({
            cityIds: zone.cityIds,
            countryId: zone.country.id,
            countryType: zone.country.type,
            priority: zone.priority,
            stateIds: zone.stateIds,
            estimatedDeliveryDays: zone.estimatedDeliveryDays,
            id: zone.id,
          })) || [],
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Stok lokasyonu getirilirken bir hata oluştu.',
      );
    }
  }

  async upsertInventoryRuleFulfillmentStrategy(
    rawData: FulfillmentStrategyOutput,
  ) {
    const data = rawData;

    const strategyId = data.uniqueId;

    const prismaDataInput: Prisma.FulfillmentStrategyCreateInput = {
      name: data.name,
      description: data.description,
      type: data.type,
      isActive: data.isActive,
      priority: data.priority,
      isDefault: data.isDefault,
      allowSplitShipment: data.settings.allowSplitShipment,
      maxSplitCount: data.settings.maxSplitCount,
      allowBackorder: data.settings.allowBackorder,
      allowDropship: data.settings.allowDropship,
      defaultLeadTimeDays: data.settings.defaultLeadTimeDays,
      processOnHolidays: data.settings.processOnHolidays,
      decisionTree: data.decisionTree as unknown as Prisma.InputJsonValue,
    };

    try {
      return await this.prismaService.$transaction(async (tx) => {
        if (data.isDefault) {
          await tx.fulfillmentStrategy.updateMany({
            where: {
              isActive: true,
              ...(strategyId ? { id: { not: strategyId } } : {}),
            },
            data: { isDefault: false },
          });
        }

        if (strategyId) {
          const existing = await tx.fulfillmentStrategy.findUnique({
            where: { id: strategyId },
          });

          if (!existing) {
            throw new BadRequestException(`Strateji bulunamadı: ${strategyId}`);
          }

          return await tx.fulfillmentStrategy.update({
            where: { id: strategyId },
            data: prismaDataInput,
          });
        } else {
          return await tx.fulfillmentStrategy.create({
            data: prismaDataInput,
          });
        }
      });
    } catch (error) {
      this.logger.error(
        `Fulfillment strategy upsert error: ${error instanceof Error ? error.message : error}`,
        error instanceof Error ? error.stack : '',
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Strateji kaydedilirken sistemsel bir hata oluştu.',
      );
    }
  }

  async getFulfillmentStrategies(
    query: GetFulfillmentStrategiesQueryDto,
  ): Promise<{
    data: FulfillmentStrategy[];
    pagination: Pagination;
  }> {
    const { page, take: limit, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.FulfillmentStrategyWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prismaService.fulfillmentStrategy.findMany({
        where,
        take: limit,
        skip: skip,
        orderBy: [
          { isDefault: 'desc' },
          { priority: 'desc' },
          { updatedAt: 'desc' },
        ],
      }),
      this.prismaService.fulfillmentStrategy.count({ where }),
    ]);

    return {
      data,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
