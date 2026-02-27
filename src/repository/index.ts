/**
 * Repository layer — public exports and DI token
 */

// Interface (forwarded from the canonical location)
export type { IUserRepository } from './interfaces/user.repository'

// Implementation
export { UserRepositoryImpl } from './impl/user.repository.impl'

/**
 * DI token for {@link IUserRepository}.
 * Bind this in the container:
 *   container.bind<IUserRepository>(USER_REPOSITORY_TOKEN).toConstantValue(
 *     new UserRepositoryImpl(userDao)
 *   )
 */
export const USER_REPOSITORY_TOKEN: unique symbol = Symbol.for('UserRepository')
