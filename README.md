# TEK TAKİP

Müşteri ve yönetici rolleri ile talep oluşturma, takip ve dosya yükleme akışları sunan Next.js paneli.

## Geliştirme

1. `cp .env.example .env.local` dosyasına kopyalayın ve `DATABASE_URL`, `AUTH_SECRET` gibi değişkenleri doldurun.
2. Yerel Postgres üzerinde tabloları oluşturmak için: `npx prisma migrate deploy`
3. Opsiyonel: İlk admin kullanıcısını oluşturmak için `npm exec prisma db seed`
4. Geliştirme sunucusu: `npm run dev`

Üretimde dosyaları kalıcı tutmak için Vercel Blob ve `BLOB_READ_WRITE_TOKEN` kullanmanız önerilir. Token yoksa dosyalar proje klasöründeki `/uploads` dizinine yazılır; bu yöntem sunucusuz ortamda kalıcı değildir.

## Dosya süresi

Yüklemeler yükleme zamanından itibaren 7 günlük süre için erişime açık tutulur. `/api/cron/dosya-temizlik` uç noktasını `Authorization: Bearer CRON_SECRET` başlığı ile çağırarak veya Vercel Cron ile otomatikleştirerek kayıtları temizleyebilirsiniz. İndirme rotaları aynı süre kontrolünü anlık olarak da uygular.

## GitHub

```bash
git init
git add .
git commit -m "TEK TAKİP ilk sürüm"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git push -u origin main
```

## Vercel

1. [Vercel](https://vercel.com) üzerinde yeni proje oluşturun ve GitHub deposunu bağlayın.
2. Ortam değişkenlerini `.env.example` satırlarına göre ekleyin. `AUTH_URL` değerini yayınlanan kök adresiniz yapın.
3. İlk dağıtımdan önce veritabanında migrasyonları çalıştırın. Örnek derleme komutu:

   `npx prisma migrate deploy && npm run build`

   Bu komutu Vercel proje ayarlarındaki “Build Command” alanına yazabilirsiniz.
4. Yöneticiyi oluşturmak için tek seferlik `npx prisma db seed` çalıştırın veya Postgres içinde elle kullanıcı ekleyin. Seed varsayılanı `.env.example` ile açıklanmıştır.
5. Cron: `vercel.json` günlük temizlik yolunu tanımlar. Projede `CRON_SECRET` değişkeni tanımlı olmalıdır.

Harici sistemler için `POST /api/tasks/update` uç noktası Türkçe veya İngilizce alan adlarını (`gizli` / `secret`, `talepId` / `taskId`, `durum` / `status`) kabul eder.
