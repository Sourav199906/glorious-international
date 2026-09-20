import SiteContent from '../models/SiteContent.js';
export async function getContent(req, res) {
  let c = await SiteContent.findOne({ key: 'main' });
  if (!c)
    c = await SiteContent.create({
      key: 'main',
      heroTitle: 'Your Journey Starts Here',
      heroSubtitle: 'Flights, Hajj and unforgettable tours with Glorious International',
    });
  res.json(c);
}
export async function updateContent(req, res) {
  res.json(
    await SiteContent.findOneAndUpdate({ key: 'main' }, req.body, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }),
  );
}
