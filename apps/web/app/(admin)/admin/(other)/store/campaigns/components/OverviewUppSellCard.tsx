'use client';
import Image from '@/components/Image';
import { AllowedDiscountedItemsBy, DiscountType } from '@repo/database/client';
import { UppSellOfferZodType, UpSellProductReturnType } from '@repo/types';
import { useEffect, useState } from 'react';
import { useAdminUpsellPreview } from '@hooks/admin/useProducts';

interface OverviewUppSellCardProps {
  offerReq: UppSellOfferZodType;
}

const OverviewUppSellCard = ({ offerReq }: OverviewUppSellCardProps) => {
  const { data, isLoading } = useAdminUpsellPreview(
    offerReq.productId,
    offerReq.variantId,
  );

  if (!offerReq.productId && !offerReq.variantId) {
    return (
      <div className="flex items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-500">
          Henüz bir teklif yok, önizleme gösterilemiyor.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8 text-center border border-red-200 rounded-lg bg-red-50">
        <p className="text-sm text-red-600">Ürün bilgisi yüklenemedi.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm max-w-md">
      <UpSellPreview product={data} offer={offerReq} />
    </div>
  );
};

interface UpSellPreviewProps {
  product: NonNullable<UpSellProductReturnType['product']>;
  offer: UppSellOfferZodType;
}

const UpSellPreview = ({ product, offer }: UpSellPreviewProps) => {
  const [timeLeft, setTimeLeft] = useState(offer.offer.countDownMinute * 60);

  useEffect(() => {
    setTimeLeft(offer.offer.countDownMinute * 60);
  }, [offer.offer.countDownMinute]);

  useEffect(() => {
    if (!offer.offer.addCountDown) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [offer.offer.addCountDown, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDiscountedPrice = () => {
    const basePrice =
      offer.offer.discountValueAppliedByPrice ===
      AllowedDiscountedItemsBy.discounted_price
        ? product.discountedPrice || product.price
        : product.price;

    if (offer.offer.discountType === DiscountType.FIXED_AMOUNT) {
      return Math.max(0, basePrice - offer.offer.discountValue);
    } else {
      return basePrice - (basePrice * offer.offer.discountValue) / 100;
    }
  };

  const finalPrice = calculateDiscountedPrice();
  const basePrice =
    offer.offer.discountValueAppliedByPrice ===
    AllowedDiscountedItemsBy.discounted_price
      ? product.discountedPrice || product.price
      : product.price;

  return (
    <div className="p-6 space-y-4">
      {/* Countdown Timer */}
      {offer.offer.addCountDown && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-xs text-red-600 font-medium mb-1">
            Bu teklif sona eriyor!
          </p>
          <p className="text-2xl font-bold text-red-600">
            {formatTime(timeLeft)}
          </p>
        </div>
      )}

      {/* Product CustomImage */}
      {product.asset && (
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100">
          <Image src={product.asset.url} alt={product.productName} />
        </div>
      )}

      {/* Title & Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {offer.title}
        </h3>
        <p className="text-sm text-gray-600">{offer.description}</p>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-900">
          {product.productName}
        </p>

        {/* Variant Options */}
        {product.variantOptions && product.variantOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.variantOptions.map((option) => (
              <div
                key={option.variantOptionId}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs"
              >
                {option.variantOptionHexValue && (
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: option.variantOptionHexValue }}
                  />
                )}
                {option.variantOptionAsset && (
                  <div className="relative w-4 h-4">
                    <Image
                      src={option.variantOptionAsset.url}
                      alt={option.variantOptionName}
                    />
                  </div>
                )}
                <span className="text-gray-700">
                  {option.variantGroupName}: {option.variantOptionName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-green-600">
            ₺{finalPrice.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 line-through">
            ₺{basePrice.toFixed(2)}
          </span>
        </div>
        <div className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
          {offer.offer.discountType === DiscountType.PERCENTAGE
            ? `%${offer.offer.discountValue} İndirim`
            : `₺${offer.offer.discountValue} İndirim`}
        </div>
      </div>

      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
        Sepete Ekle
      </button>

      {offer.offer.showPrroductIfInCart && (
        <p className="text-xs text-gray-500 text-center">
          * Bu ürün sepette olsa bile gösterilecektir
        </p>
      )}
    </div>
  );
};

export default OverviewUppSellCard;
