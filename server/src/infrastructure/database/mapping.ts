export interface EntityMapper<DomainEntity, DatabaseRow> {
  toDomain(row: DatabaseRow): DomainEntity;
  toPersistence(entity: DomainEntity): DatabaseRow;
}
