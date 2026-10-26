import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Sparkles, Calendar, MapPin } from 'lucide-react'
import { getTodayDelivery } from '../api/subscriptions'
import { useAuth } from '../context/AuthContext'
import Card from './ui/Card'
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
    <Card className="mb-6 overflow-hidden border-chili-200 bg-gradient-to-br from-cream-50 via-white to-cream-100 p-0 shadow-sm ring-1 ring-chili-100">
      <div className="flex flex-col sm:flex-row items-stretch">
        {product?.image_url ? (
          <div className="relative w-full sm:w-44 h-36 sm:h-auto shrink-0 bg-cream-200">
            <ProductImage
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center gap-1 rounded-pill bg-chili-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-xs">
                <Sparkles className="h-3 w-3" />
                Today's Meal
              </span>
            </div>
          </div>
        ) : null}

        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-chili-600">
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

            <h3 className="mt-1 font-display text-lg font-bold text-ink-900">
              {product ? product.name : primary.message}
            </h3>

            {product?.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-ink-500">{product.description}</p>
            ) : null}

            {primary.delivery_address ? (
              <p className="mt-2.5 flex items-center gap-1 text-[11px] text-ink-400">
                <MapPin className="h-3.5 w-3.5 text-chili-400 shrink-0" />
                <span className="line-clamp-1">{primary.delivery_address}</span>
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-cream-200">
            <div className="text-[11px] text-ink-400 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{data.day_of_week}, {data.date}</span>
            </div>
            <Link
              to={`/subscriptions/${primary.subscription_id}`}
              className="text-xs font-semibold text-chili-600 hover:text-chili-700 transition-colors"
            >
              View Schedule &rarr;
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
