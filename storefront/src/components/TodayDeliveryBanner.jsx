import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Sparkles, Calendar, MapPin, ArrowRight } from 'lucide-react'
import { getTodayDelivery } from '../api/subscriptions'
import { useAuth } from '../context/AuthContext'
import Badge from './ui/Badge'
import ProductImage from './ProductImage'

export default function TodayDeliveryBanner() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['today-delivery'],
    queryFn: () => getTodayDelivery(),
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
  })

  if (!user || isLoading || !data?.success) {
    return null
  }

  const primary = data.primary_delivery
  if (!primary) {
    return null
  }

  const product = primary.scheduled_product

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch">
        {product?.image_url ? (
          <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0 bg-[#F3EBDD]">
            <ProductImage
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#9B2C2C] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                <Sparkles className="h-3 w-3" />
                Today's Meal
              </span>
            </div>
          </div>
        ) : null}

        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9B2C2C]">
                {primary.plan_name}
              </span>
              <Badge
                tone={
                  primary.delivery_status === 'DELIVERING_TODAY'
                    ? 'success'
                    : primary.delivery_status === 'WEEKEND_EXCLUDED'
                    ? 'neutral'
                    : 'warning'
                }
              >
                {primary.delivery_status === 'DELIVERING_TODAY'
                  ? 'Delivering Today'
                  : primary.delivery_status === 'WEEKEND_EXCLUDED'
                  ? 'Weekend Excluded'
                  : primary.delivery_status === 'SERVICE_HOLIDAY'
                  ? 'Kitchen Holiday'
                  : 'Skipped Today'}
              </Badge>
            </div>

            <h3 className="mt-1 font-serif text-lg font-bold text-[#1C1917]">
              {product ? product.name : primary.message}
            </h3>

            {product?.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-[#78716C] leading-relaxed">
                {product.description}
              </p>
            ) : null}

            {primary.delivery_address ? (
              <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[#78716C]">
                <MapPin className="h-3.5 w-3.5 text-[#9B2C2C] shrink-0" />
                <span className="line-clamp-1">{primary.delivery_address}</span>
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#E6D9C5] text-xs">
            <div className="text-[#78716C] flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#9B2C2C]" />
              <span>{data.day_of_week}, {data.date}</span>
            </div>
            <Link
              to={`/subscriptions/${primary.subscription_id}`}
              className="inline-flex items-center gap-1 font-bold text-[#9B2C2C] hover:text-[#7B1F23] transition-colors"
            >
              <span>View Schedule</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
